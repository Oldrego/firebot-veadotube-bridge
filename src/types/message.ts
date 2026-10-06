// Base Types

export type SentInstanceMessage = { channel: "instance", json: SentInstanceJson };
export type ReceivedInstanceMessage = { channel: "instance", json: ReceivedInstanceJson };

export type SentNodesMessage = { channel: "nodes",    json: SentNodesJson };
export type ReceivedNodesMessage = { channel: "nodes",    json: ReceivedNodesJson };

// Base Unions

export type AnyMessage =
  | SentMessage
  | ReceivedMessage;

export type AnyJson =
  | SentInstanceJson
  | SentNodesJson
  | ReceivedInstanceJson
  | ReceivedNodesJson

export type SentMessage =
  | SentInstanceMessage
  | SentNodesMessage;

export type ReceivedMessage =
  | ReceivedInstanceMessage
  | ReceivedNodesMessage;

export type InstanceMessage =
  | SentInstanceMessage
  | ReceivedInstanceMessage;

export type NodesMessage =
  | SentNodesMessage
  | ReceivedNodesMessage;

export type Payload =
  | SentPayload
  | ReceivedPayload;

export type SentPayload =
  | SentBooleanPayload
  | SentNumberPayload
  | SentStateEventPayload;

export type ReceivedPayload =
  | ReceivedBooleanPayload
  | ReceivedNumberPayload
  | ReceivedStateEventPayload;

// Discriminated Unions

export type SentInstanceJson =
  | {
    event: "info"
  };

export type ReceivedInstanceJson =
  | {
    event: "info";
    name: string;
    id: string;
    version: string;
    language: string;
    server: string;
  };

export type SentNodesBooleanJson = {
    event: "payload";
    type: "boolean";
    id: string;
    payload: SentBooleanPayload;
};
export type SentNodesNumberJson = {
  event: "payload";
  type: "number";
  id: string;
  payload: SentNumberPayload;
};
export type SentNodesStateEventsJson = {
  event: "payload";
  type: "stateEvents";
  id: string;
  payload: SentStateEventPayload;
};
export type SentNodesListJson = {
  event: "list";
};
export type SentNodesListenJson =
  | {
    event: "listen" | "unlisten";
    token?: string
  }
  | {
    event: "payload";
    type: "boolean" | "number" | "stateEvents";
    id: string;
    payload: SentListenPayload;
  };

export type SentNodesJson =
  | SentNodesBooleanJson
  | SentNodesNumberJson
  | SentNodesStateEventsJson
  | SentNodesListJson
  | SentNodesListenJson;

export type SentListenPayload = {
  event: "listen" | "unlisten",
  token?: string
}

export type SentBooleanPayload =
  | {
    event: "set",
    value: boolean
  }
  | {
    event: "get" | "toggle" | "clear"
  };

export type SentNumberPayload =
  | {
    event: "set" | "add",
    value: {
      value: number,
      min: number,
      max: number
    }
  }
  | {
    event: "set" | "add",
    value: number
  }
  | {
    event: "get" | "clear"
  };

export type SentStateEventPayload =
  | {
    event: "list" | "peek" | "clear"
  }
  | {
    event: "thumb" | "set" | "push" | "pop" | "toggle",
    state: string
  };

export type ReceivedNodesBooleanJson = {
  event: "payload";
  type: "boolean";
  id: string;
  name: string;
  payload: ReceivedBooleanPayload;
};
export type ReceivedNodesNumberJson = {
  event: "payload";
  type: "number";
  id: string;
  name: string;
  payload: ReceivedNumberPayload;
};
export type ReceivedNodesStateEventsJson = {
  event: "payload";
  type: "stateEvents";
  id: string;
  name: string;
  payload: ReceivedStateEventPayload;
};
export type ReceivedNodesListJson = {
  event: "list";
  entries: NodeEntries;
};

type NodeEntries = Node[]
type Node = { type: "boolean" | "number" | "stateEvents"; id: string; name: string; }

export type ReceivedNodesJson =
  | ReceivedNodesBooleanJson
  | ReceivedNodesNumberJson
  | ReceivedNodesStateEventsJson
  | ReceivedNodesListJson;

export type ReceivedBooleanPayload = boolean | undefined;

export type ReceivedNumberPayload = { value: number | undefined; min: number | undefined; max: number | undefined; };


export type ReceivedStateEventPayload =
  | ReceivedStateEventListPayload
  | ReceivedStateEventThumbPayload
  | ReceivedStateEventPeekPayload;

export type ReceivedStateEventListPayload = {
    event: "list";
    states: StateEvent[]
  }
export type ReceivedStateEventThumbPayload = {
    event: "thumb";
    state: string;
    hash: string | undefined;
    width: number | undefined;
    height: number | undefined;
    png: string | undefined;
  }
export type ReceivedStateEventPeekPayload = {
    event: "peek";
    state: string | undefined;
  }

export type StateEvent = {
  id: string;
  name: string;
  thumbHash?: string | undefined;
}

export type ReceivedPayloadMessage = {
  channel: "nodes";
  json: ReceivedNodesBooleanJson | ReceivedNodesNumberJson | ReceivedNodesStateEventsJson;
}

export type ReceivedNodesListMessage = {
  channel: "nodes";
  json: ReceivedNodesListJson;
}

// Possible Responses

export type Response =
  | InstanceInfoResponse
  | ListNodesResponse
  | BooleanResponse
  | NumberResponse
  | StateEventResponse;

export type InstanceInfoResponse = {
  name: string;
  id: string;
  version: string;
  language: string;
  server: string;
  time: number;
};
export type ListNodesResponse = NodeEntries;
export type BooleanResponse = ReceivedBooleanPayload;
export type NumberResponse = ReceivedNumberPayload;

export type StateEventResponse =
  | StateEventListResponse
  | StateEventThumbResponse
  | StateEventPeekResponse;

export type StateEventListResponse = StateEvent[];
export type StateEventThumbResponse = {
  hash: string | undefined;
  width: number | undefined;
  height: number | undefined;
  png: string | undefined;
};
export type StateEventPeekResponse = string | undefined;

export type CleanedPayload =
  | boolean
  | number
  | string;
