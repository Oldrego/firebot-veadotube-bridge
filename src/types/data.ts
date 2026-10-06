// Emitted Data Object Types

export type connectionEventData = {
  instanceName: string,
  instanceId: string,
  changeType: "added" | "removed" | "failed"
};

export type nodeListEventData = {
  instanceName: string,
  instanceId: string,
  nodeId: string,
  nodeType: "boolean" | "number" | "stateEvents",
  changeType: "added" | "removed"
};

export type nodeEventData =
  | {
      instanceName: string;
      instanceId: string;
      nodeName: string;
      nodeId: string;
      nodeType: "boolean";
      payload: boolean;
  }
  | {
      instanceName: string;
      instanceId: string;
      nodeName: string;
      nodeId: string;
      nodeType: "number";
      payload: number;
  }
  | {
    instanceName: string;
    instanceId: string;
    nodeName: string;
    nodeId: string;
    nodeType: "stateEvents";
    payload: string;
};

export type logEventData = {
  origin: string,
  type: "debug" | "error" | "info" | "warn",
  message: string
}
