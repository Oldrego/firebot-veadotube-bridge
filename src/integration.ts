import firebot from "@crowbartools/firebot-types";
import EventEmitter from "node:events";
import type { Integration, IntegrationController, IntegrationData } from "@crowbartools/firebot-types";
import { VeadotubeManager } from "./veadotube/manager";
import {
  EVENT_SOURCE_ID,
  NODE_CHANGED_EVENT_ID,
  NODE_LIST_CHANGED_EVENT_ID,
  INSTANCE_CONNECTION_CHANGED_EVENT_ID
} from "./events/source";

export const INTEGRATION_ID = "veadotube";

type VeadotubeParams = {
  connection: { directory: string };
};

class VeadotubeIntegrationController
  extends EventEmitter
  implements IntegrationController<VeadotubeParams> {
  connected = false;
  manager: VeadotubeManager | null = null;

  async init(linked: boolean, integrationData: IntegrationData<VeadotubeParams>) {
    // Skip! I think. (It's localhost.)
  }

  async connect(integrationData: IntegrationData<VeadotubeParams>) {
    const directory = integrationData.userSettings?.connection?.directory || undefined;

    this.manager = VeadotubeManager.create(directory);

    this.manager.on("nodeEvent", (event) => {
      firebot.events.trigger(EVENT_SOURCE_ID, NODE_CHANGED_EVENT_ID, event);
    });
    this.manager.on("nodeListEvent", (event) => {
      firebot.events.trigger(EVENT_SOURCE_ID, NODE_LIST_CHANGED_EVENT_ID, event);
    });
    this.manager.on("connectionEvent", (event) => {
      firebot.events.trigger(EVENT_SOURCE_ID, INSTANCE_CONNECTION_CHANGED_EVENT_ID, event);
    });
    this.manager.on("logEvent", (event) => {
           if (event.type === "debug") firebot.logger.debug(`[${event.origin}]: ${event.message}`);
      else if (event.type === "error") firebot.logger.error(`[${event.origin}]: ${event.message}`);
      else if (event.type === "info")  firebot.logger.info( `[${event.origin}]: ${event.message}`);
      else if (event.type === "warn")  firebot.logger.warn( `[${event.origin}]: ${event.message}`);
    })

    try {
      await this.manager.start();
      this.connected = true;
      this.emit("connected", INTEGRATION_ID);
      firebot.logger.info(`[veadotube]: Connected. Found ${this.manager.getInstances().length} instance(s)`);
    }
    catch (error) {
      await this.disconnect();
      firebot.logger.error(`[veadotube]: Unable to connect: ${error}`);
      throw error;
    }

  }

  async disconnect() {
    await this.manager?.stop();
    this.manager = null;
    this.connected = false;
    this.emit("disconnected", INTEGRATION_ID);
  }
}

export const veadotubeController = new VeadotubeIntegrationController();

export const veadotubeIntegration: Integration<VeadotubeParams> = {
  definition: {
    id: INTEGRATION_ID,
    name: "Veadotube",
    description: "Control running veadotube instances",
    connectionToggle: true,
    configurable: true,
    linkType: "none",
    settingCategories: {
      connection: {
        title: "Connection",
        settings: {
          directory: {
            name: "directory",
            type: "filepath",
            title: "veadotube instances directory",
            tip: "Leave blank to use the default (~/.veadotube/instances). It's usually there",
            fileOptions: {
              directoryOnly: true,
              filters: [],
              title: "Select veadotube directory",
              buttonLabel: "Select"
            }
          } as any
        }
      }
    }
  },
  integration: veadotubeController
};
