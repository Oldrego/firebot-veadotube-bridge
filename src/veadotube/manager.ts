import os from "node:os";
import path from "node:path"
import { VeadotubeInstance } from "./instance";
import EventEmitter from "node:events";
import { watch, readdir, readFile } from "node:fs/promises"
import { MANAGER_REWATCH_INTERVAL, MANAGER_READ_INTERVAL } from "./constants";

export class VeadotubeManager extends EventEmitter {
  instances: VeadotubeInstance[];
  directory: string;
  started = false;

  private watcherController?: AbortController;

  private readonly options = {
    rewatchInterval: MANAGER_REWATCH_INTERVAL,
    readInterval: MANAGER_READ_INTERVAL
  }

  constructor(instances: VeadotubeInstance[], directory: string) {
    super();
    this.instances = instances;
    this.directory = directory;
  }

  public static create(directory?: string): VeadotubeManager {
    let instances: VeadotubeInstance[] = [];
    directory ??= path.join(os.homedir(), ".veadotube", "instances"); // The default path for veadotube
    return new VeadotubeManager(instances, directory);
  }

  public async start(): Promise<void> {
    if (this.started) return;
    await this.checkDirectory();
    await this.connectAll();
    this.watchDirectory();
    this.started = true;
  }

  public async stop() {
    this.watcherController?.abort();
    this.disconnectAll();
    this.started = false;
  }

  public async checkDirectory() {
    try {
      const files = await readdir(this.directory);
      for (const file of files) {
        const filepath = path.join(this.directory, file);
        try {
          const contents = await readFile(filepath, "utf8");
          this.addInstance(VeadotubeInstance.fromJson(contents));
        }
        catch (error) {
          if (error instanceof Error && error.cause === "NOSERVER") {
            this.emit("logEvent", {origin: "manager", type: "info", message: `Instance not ready: ${error}`});
          }
          else {
            this.emit("logEvent", {origin: "manager", type: "warn", message: `An error occurred reading file ${file}: ${error}`});
          }
        }
      }
    }
    catch (error) {
      throw new Error(`The directory ${this.directory} is invalid: ${error}`);
    }
  }

  private addInstance(instance: VeadotubeInstance): boolean {
    if (this.instances.some((existing) => existing.id === instance.id )) {
      return false;
    }

    this.instances.push(instance);

    instance.on("nodeEvent", (event) => {
      this.emit("nodeEvent", event);
    });
    instance.on("nodeListEvent", (event) => {
      this.emit("nodeListEvent", event);
    });
    instance.on("connectionEvent", (event) => {
      if (event.changeType === "failed") this.removeInstance(event.instanceId);
    });
    instance.on("logEvent", (event) => {
      this.emit("logEvent", event);
    });

    this.emit("connectionEvent", {
      instanceName: instance.name,
      instanceId: instance.id,
      changeType: "added"
    });

    return true;
  }

  private removeInstance(id: string): boolean {
    const index = this.instances.findIndex((instance) => instance.id === id );

    if (index === -1) {
      return false;
    }

    const [instance] = this.instances.splice(index, 1);

    instance.disconnect();

    this.emit("connectionEvent", {
      instanceName: instance.name,
      instanceId: instance.id,
      changeType: "removed"
    });

    return true;
  }

  private async watchDirectory() {
    if (this.watcherController) return;

    let watcherController = new AbortController();
    this.watcherController = watcherController;

    try {
      const watcher = watch(this.directory, {signal: this.watcherController.signal});

      for await (const event of watcher) {
        if (!event.filename) {
          continue;
        }

        const file = event.filename!.toString();

        if (event.eventType === "rename") {
          await new Promise(_ => setTimeout(_, this.options.readInterval));
          try {
            const contents = await readFile(path.join(this.directory, file), "utf-8");
            let instance = VeadotubeInstance.fromJson(contents);
            let added = this.addInstance(instance);
            if (added) instance.connect().catch((error) => {
              this.emit("logEvent", { origin: "manager", type: "warn", message: `There was an error connecting to ${instance.name}: ${error}` });
            });
          }
          catch (error: any) {
            if (error.code === "ENOENT") this.removeInstance(file); // The filename matches the instance id, fyi
            else if (error.cause === "NOSERVER") {
              this.emit("logEvent", {origin: "manager", type: "info", message: `Instance not ready: ${error}`});
            }
            else this.emit("logEvent", { origin: "manager", type: "warn", message: `Could not read ${file}: ${error}` });
          }
        }
        else if (event.eventType === "change") {
          await new Promise(_ => setTimeout(_, this.options.readInterval));
          try {
            const contents = await readFile(path.join(this.directory, file), "utf-8");
            let instance = VeadotubeInstance.fromJson(contents);
            let added = this.addInstance(instance);
            if (added) instance.connect().catch((error) => {
              this.emit("logEvent", { origin: "manager", type: "warn", message: `There was an error connecting to ${instance.name}: ${error}` });
            });
          }
          catch (error: any) {
            // Spams the logs. This message only really matters when first reading a file,
            // such as when checkDirectory or rename event occurs.

            // this.emit("logEvent", { origin: "manager", type: "warn", message: `Could not read ${file}: ${error}` });
          }
        }
      }
    }
    catch (error: any) {
      if (error.name === "AbortError") {
        this.emit("logEvent", {origin: "manager", type: "debug", message: `Directory watcher stopped`});
        this.watcherController = undefined;
        return;
      }
      else if (error.code === "EPERM") {
        this.emit("logEvent", {origin: "manager", type: "error", message: `Attempted to watch ${this.directory}, but it doesn't exist`});
        this.watcherController = undefined;
        return;
      }
      else {
        this.emit("logEvent", {origin: "manager", type: "warn", message: `Directory watcher hiccuped: ${error}`});
        if (this.watcherController === watcherController) this.watcherController = undefined;
        await new Promise(_ => setTimeout(_, this.options.rewatchInterval));
        this.watchDirectory();
      }
    }
  }

  public async connectAll() {
    for (const instance of this.instances) {
      instance.connect().catch((error) => {
        this.emit("logEvent", {origin: "manager", type: "warn", message: `There was an error connecting to ${instance.name}: ${error}`});
      });
    }
  }

  public disconnectAll() {
    let instances = [...this.instances];
    for (const instance of instances) {
      instance.disconnect();
    }
  }

  public getInstance(name: string): VeadotubeInstance | undefined {
    return this.instances.find((instance) => instance.name === name );
  }

  public getInstances(name?: string): VeadotubeInstance[] {
    if (name === undefined) {
      return this.instances.map((instance) => instance );
    }
    else {
      return this.instances.filter((instance) => instance.name === name );
    }
  }
}
