import {
  parseMessage,
  createMessage,
  messageKey,
  nodeKey,
  cleanPayload,
  SentMessage,
  ReceivedMessage,
  ReceivedNodesListMessage,
  Response,
  InstanceInfoResponse,
  ListNodesResponse,
  BooleanResponse,
  NumberResponse,
  StateEventListResponse,
  StateEventThumbResponse,
  StateEventPeekResponse,
} from "./message";
import EventEmitter from "node:events";
import WebSocket from "ws"
import {
  APPLICATION_NAME,
  INSTANCE_CONNECT_INTERVAL,
  INSTANCE_RECONNECT_INTERVAL,
  INSTANCE_TIMEOUT_INTERVAL,
  INSTANCE_MAX_RETRIES
} from "./constants";

export class VeadotubeInstance extends EventEmitter {
  name: string;
  id: string;
  version: string;
  language: string;
  server: string;
  time: number;
  nodes: VeadotubeNode[];

  private pending: Map<string, PendingRequest[]>;
  private socket?: WebSocket;
  private newSocket?: WebSocket;

  private shouldListenNodes = false;

  private shouldReconnect = true;
  private reconnection?: Promise<void>;

  private readonly options = {
    connectInterval: INSTANCE_CONNECT_INTERVAL,
    reconnectInterval: INSTANCE_RECONNECT_INTERVAL,
    timeoutInterval: INSTANCE_TIMEOUT_INTERVAL,
    maxRetries: INSTANCE_MAX_RETRIES,
  }

  constructor(name: string, id: string, version: string, language: string, server: string, time: number) {
    super();
    this.name = name;
    this.id = id;
    this.version = version;
    this.language = language;
    this.server = server;
    this.time = time;
    this.nodes = [];
    this.pending = new Map<string, PendingRequest[]>();
  }

  public static fromJson(json: string): VeadotubeInstance {
    let obj = JSON.parse(json);
    if (!obj.server) {
      throw new Error(`Instance JSON doesn't have server yet`, { cause: `NOSERVER` });
    }
    if (       obj                        &&
        typeof obj.name     === "string"  &&
        typeof obj.id       === "string"  &&
        typeof obj.version  === "string"  &&
        typeof obj.language === "string"  &&
        typeof obj.server   === "string"  &&
        typeof obj.time     === "number") {

      if (Math.floor(Date.now() / 1000) - obj.time > 10) {
        throw new Error(`Instance JSON is stale`);
      }

      return new VeadotubeInstance(obj.name, obj.id, obj.version, obj.language, obj.server, obj.time);
    }
    else {
      throw new Error(`Invalid instance JSON: ${json}`);
    }
  }

  public async connect() {
    if (this.socket || this.newSocket) {
      this.emit("logEvent", {origin: this.name, type: "debug", message: `Already ${this.socket ? "connected" : "connecting"} to WebSocket`});
      return;
    }

    let server = `ws://${this.server}?n=${encodeURIComponent(APPLICATION_NAME)}`;
    this.emit("logEvent", { origin: this.name, type: "info", message: `Connecting to ${this.server}...` });

    const socket = new WebSocket(server);
    this.newSocket = socket;

    try {
      await new Promise<void>((resolve, reject) => {

        let timeout = setTimeout(() => {
          socket?.close();
          this.newSocket = undefined;
          reject(new Error(`WebSocket connection timed out`));
        }, this.options.connectInterval);

        socket!.on("message", (event) => this.handleMessage(event));
        socket!.on("error", (error) => {
          this.emit("logEvent", { origin: this.name, type: "error", message: `There was a WebSocket connection error: ${error.message}` });
        });

        socket!.on("close", (code, reason) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket connection was immediately disconnected with code ${code}`));
          this.handleClose(socket, code, reason);
        });

        socket!.on("open", () => {
          clearTimeout(timeout);
          if (this.newSocket !== socket) {
            socket.close(1000);
            reject(new Error("Websocket connection already established"));
            return;
          }
          this.socket = socket;
          this.newSocket = undefined;
          this.emit("logEvent", { origin: this.name, type: "info", message: `Successfully connected to ${this.server}!` });
          resolve();
        });
      });
    }
    catch (error) {
      if (this.newSocket === socket) this.newSocket = undefined;
      socket.close();
      if (this.shouldReconnect) this.reconnect();
      throw new Error(`An error occurred while connecting: ${error}`);
    }

    try {
      this.nodes = await this.getNodes();
    }
    catch (error) {
      // This also occurs when there are no nodes within the instance (like in a new project).
      // Let it continue, it will update later
      this.emit("logEvent", { origin: this.name, type: "warn", message: `Unable to get node list: ${error} (Is this a new project?)` });
    }
    try {
      this.listenNodeList();
      for (const node of this.nodes) this.listen(node.type, node.id);
    }
    catch (error) {
      socket.close();
      throw new Error(`Unable to listen to node list: ${error}`);
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    this.newSocket?.close(1000);
    this.socket?.close(1000);
  }

  private reconnect() {

    this.reconnection ??= (async () => {
      try {
        for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {

          await new Promise(_ => setTimeout(_, this.options.reconnectInterval));
          if (!this.shouldReconnect) return;

          try {
            await this.connect();
            return;
          }
          catch (error) {
            this.emit("logEvent", {origin: this.name, type: "debug", message: `(${attempt}) Reconnect failed: ${error}`});
          }
        }
        this.shouldReconnect = false;
        this.emit("connectionEvent", {
          instanceName: this.name,
          instanceId: this.id,
          changeType: "failed"
        });
      }
      finally {
        this.reconnection = undefined;
      }
    })();

  }

  private request<T>(message: SentMessage): Promise<T> {

    return new Promise<T>((resolve, reject) => {
      const key = messageKey(message);

      if (message.json.event === "payload") {
        if (!(this.findNode(message.json.type, message.json.id))) {
          reject(new Error(`No matching ${message.json.type} node with id ${message.json.id}`));
          return;
        }
      }

      if (!this.socket || !(this.socket?.readyState === WebSocket.OPEN)) {
        reject(new Error("WebSocket is not connected"));
        return;
      }

      let requests = this.pending.get(key)

      if (!requests) {
        requests = [];
        this.pending.set(key, requests);
      }

      let timeout = setTimeout(() => {
        let index = requests.indexOf(request);
        if (index !== -1) {
          requests.splice(index, 1);
          if (requests.length == 0) {
            this.pending.delete(key);
          }
          reject(new Error(`Request timed out after ${this.options.timeoutInterval / 1000} seconds for ${key}`));
        }
      },
        (this.options.timeoutInterval)
      );

      const request: PendingRequest = {
        timeout,
        resolve: (value:unknown) => resolve(value as T),
        reject
      };

      requests.push(request);

      try {
        this.socket.send(createMessage(message));
      } catch (error) {
        clearTimeout(timeout);
        let index = requests.indexOf(request);
        if (index !== -1) {
          requests.splice(index, 1);
          if (requests.length == 0) {
            this.pending.delete(key);
          }
          reject(error);
        }
      }
    });
  }

  private send(message: SentMessage) {
    if (!this.socket || !(this.socket?.readyState === WebSocket.OPEN)) {
      this.emit("logEvent", {origin: this.name, type: "debug", message: `Can't send message. WebSocket is not connected`});
      return;
    }

    try {
      this.socket.send(createMessage(message));
    } catch (error) {
      this.emit("logEvent", {origin: this.name, type: "error", message: `There was an error sending the message "${message.channel}: ${JSON.stringify(message)}": ${error}`});
    }
  }

  private handleMessage(data: WebSocket.RawData) {
    let message: ReceivedMessage;

    try {
      const text = Buffer.isBuffer(data)
        ? data.toString("utf8")
        : data instanceof ArrayBuffer
          ? Buffer.from(data).toString("utf8")
          : Buffer.concat(data).toString("utf8");

      message = parseMessage(text);
    }
    catch (error) {
      this.emit("logEvent", {
        origin: this.name,
        type: "error",
        message: `Bad WebSocket message: ${error}`,
      });
      return;
    }

    if (this.handlePendingResponse(message)) {
      return;
    }

    this.handleNodeEvent(message);
  }

  private handlePendingResponse(message: ReceivedMessage): boolean {
    const key = messageKey(message);
    const requests = this.pending.get(key);

    if (!requests) return false;

    const request = requests.shift();
    clearTimeout(request?.timeout);

    if (requests.length == 0) {
      this.pending.delete(key);
    }

    if (message.channel === "instance") {
      request?.resolve({
        name: message.json.name,
        id: message.json.id,
        version: message.json.version,
        language: message.json.language,
        server: message.json.server,
        time: this.time
      });
    }
    else if (message.channel === "nodes") {
      if (message.json.event === "list") {
        request?.resolve(message.json.entries);
      }
      else if (message.json.event === "payload") {
        if (message.json.type === "boolean" || message.json.type === "number") {
          request?.resolve(message.json.payload);
        }
        else if (message.json.type === "stateEvents") {
          if (message.json.payload.event === "list") {
            request?.resolve(message.json.payload.states);
          }
          else if (message.json.payload.event === "thumb") {
            request?.resolve({
              hash: message.json.payload.hash,
              width: message.json.payload.width,
              height: message.json.payload.height,
              png: message.json.payload.png
            });
          }
          else if (message.json.payload.event === "peek") {
            request?.resolve(message.json.payload.state);
          }
        }
      }
    }

    return true;
  }

  private handleNodeEvent(message: ReceivedMessage) {

    if (message.channel === "instance") {
      if (message.json.event === "info") {
        this.name = message.json.name;
        this.id = message.json.id;
        this.version = message.json.version;
        this.language = message.json.language;
        this.server = message.json.server;
      }
      return;
    }
    else if (message.channel === "nodes") {
      if (message.json.event === "list") {
        this.updateList(message as ReceivedNodesListMessage);
        return;
      }
      if (message.json.event === "payload") {
        this.emit("nodeEvent", {
          instanceName: this.name,
          instanceId: this.id,
          nodeName: message.json.name,
          nodeId: message.json.id,
          nodeType: message.json.type,
          payload: cleanPayload(message),
        });
        return;
      }
    }

    this.emit("logEvent", {origin: this.id, type: "warn", message: `Message has no matching request or function: ${message.channel}: ${JSON.stringify(message.json)}`});
  }

  private async handleClose(socket: WebSocket, code: number, reason: Buffer) {

    this.emit("logEvent", { origin: this.name, type: "info", message: `Closed event occurred with code ${code}` });

    if (this.newSocket === socket) {
      this.newSocket = undefined;
      return;
    }

    if (this.socket !== socket) return; // Stale...

    this.socket = undefined;
    this.rejectAllPending();
    if (this.shouldReconnect) this.reconnect();
  }

  private rejectAllPending() {
    for (const requests of this.pending.values()) {
      for (const request of requests) {
        request.reject(new Error("WebSocket disconnected"));
        clearTimeout(request?.timeout);
      }
    }
    this.pending.clear();
  }

  private findNode(type: "boolean" | "number" | "stateEvents", id: string, name?: string): VeadotubeNode | undefined {
    return this.nodes.find(node => node.type === type && node.id === id && (name === undefined || node.name === name));
  }

  private findNodes(type: "boolean" | "number" | "stateEvents", id: string, name?: string): VeadotubeNode[] {
    return this.nodes.filter(node => node.type === type && node.id === id && (name === undefined || node.name === name));
  }

  private updateList(message: ReceivedNodesListMessage) {
    let newnodes: VeadotubeNode[] = message.json.entries;

    const oldSet = new Set(this.nodes.map(nodeKey));
    const newSet = new Set(message.json.entries.map(nodeKey));

    for (const node of newnodes) {
      if (!oldSet.has(nodeKey(node))) {
        this.listen(node.type, node.id);
        this.emit("nodeListEvent", {
          instanceName: this.name,
          instanceId: this.id,
          nodeId: node.id,
          nodeType: node.type,
          changeType: "added"

        });
      }
    }

    for (const node of this.nodes) {
      if (!newSet.has(nodeKey(node))) {
        this.unlisten(node.type, node.id);
        this.emit("nodeListEvent", {
          instanceName: this.name,
          instanceId: this.id,
          nodeId: node.id,
          nodeType: node.type,
          changeType: "removed"
        });
      }
    }

    this.nodes = newnodes;
  }

  // Public API Methods

  public getInfo(): Promise<InstanceInfoResponse> {
    return this.request<InstanceInfoResponse>({
      channel: "instance",
      json: {
        event: "info"
      }
    });
  }

  public getNodes(): Promise<ListNodesResponse> {
    return this.request<ListNodesResponse>({
      channel: "nodes",
      json: {
        event: "list"
      }
    });
  }

  public listenNodeList(token?: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "listen",
        token
      }
    })
  }

  public listen(type: "boolean" | "number" | "stateEvents", id: string, token?: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type,
        id,
        payload: {
          event: "listen",
          token
        }
      }
    })
  }

  public unlisten(type: "boolean" | "number" | "stateEvents", id: string, token?: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type,
        id,
        payload: {
          event: "unlisten",
          token
        }
      }
    })
  }

  public getBoolean(id: string): Promise<BooleanResponse> {
    return this.request<BooleanResponse>({
      channel: "nodes",
      json: {
        event: "payload",
        type: "boolean",
        id,
        payload: {
          event: "get"
        }
      }
    });
  }

  public setBoolean(id: string, value: boolean) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "boolean",
        id,
        payload: {
          event: "set",
          value
        }
      }
    });
  }

  public toggleBoolean(id: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "boolean",
        id,
        payload: {
          event: "toggle"
        }
      }
    });
  }
  public clearBoolean(id: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "boolean",
        id,
        payload: {
          event: "clear"
        }
      }
    });
  }

  public getNumber(id: string): Promise<NumberResponse> {
    return this.request<NumberResponse>({
      channel: "nodes",
      json: {
        event: "payload",
        type: "number",
        id,
        payload: {
          event: "get"
        }
      }
    });
  }

  public setNumber(id: string, value: number, min?: number, max?: number) {
    if ((min === undefined) && (max === undefined)) {
      this.send({
        channel: "nodes",
        json: {
          event: "payload",
          type: "number",
          id,
          payload: {
            event: "set",
            value
          }
        }
      });
    }
    else if ((min !== undefined) && (max !== undefined)) {
      this.send({
        channel: "nodes",
        json: {
          event: "payload",
          type: "number",
          id,
          payload: {
            event: "set",
            value: {
              value,
              min,
              max
            }
          }
        }
      });
    }
    else {
      this.send({
        channel: "nodes",
        json: {
          event: "payload",
          type: "number",
          id,
          payload: {
            event: "set",
            value
          }
        }
      });
      this.emit("logEvent", {origin: this.name, type: "warn", message: `Range must include both min and max variables`});
    }
  }

  public addNumber(id: string, value: number, min?: number, max?: number) {
    if ((min === undefined) && (max === undefined)) {
      this.send({
        channel: "nodes",
        json: {
          event: "payload",
          type: "number",
          id,
          payload: {
            event: "add",
            value
          }
        }
      });
    }
    else if ((min !== undefined) && (max !== undefined)) {
      this.send({
        channel: "nodes",
        json: {
          event: "payload",
          type: "number",
          id,
          payload: {
            event: "add",
            value: {
              value,
              min,
              max
            }
          }
        }
      });
    }
    else {
      this.send({
        channel: "nodes",
        json: {
          event: "payload",
          type: "number",
          id,
          payload: {
            event: "add",
            value
          }
        }
      });
      this.emit("logEvent", {origin: this.name, type: "warn", message: `Range must include both min and max variables`});
    }
  }

  public clearNumber(id: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "number",
        id,
        payload: {
          event: "clear"
        }
      }
    });
  }

  public listStates(id: string): Promise<StateEventListResponse> {
    return this.request<StateEventListResponse>({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "list"
        }
      }
    });
  }

  public getStateThumbnail(id: string, state: string): Promise<StateEventThumbResponse> {
    return this.request<StateEventThumbResponse>({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "thumb",
          state
        }
      }
    });
  }

  public peekState(id: string): Promise<StateEventPeekResponse> {
    return this.request<StateEventPeekResponse>({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "peek"
        }
      }
    });
  }

  public setState(id: string, state: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "set",
          state
        }
      }
    });
  }

  public pushState(id: string, state: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "push",
          state
        }
      }
    });
  }

  public popState(id: string, state: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "pop",
          state
        }
      }
    });
  }

  public toggleState(id: string, state: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "toggle",
          state
        }
      }
    });
  }

  public clearStates(id: string) {
    this.send({
      channel: "nodes",
      json: {
        event: "payload",
        type: "stateEvents",
        id,
        payload: {
          event: "clear"
        }
      }
    });
  }
}

type VeadotubeNode =
  | {
    type: "boolean";
    id: string;
    name: string;
  }
  | {
    type: "number";
    id: string;
    name: string;
  }
  | {
    type: "stateEvents";
    id: string;
    name: string;
  };

interface PendingRequest {
  timeout: NodeJS.Timeout;
  resolve: (value: Response) => void;
  reject: (reason?: unknown) => void;
};
