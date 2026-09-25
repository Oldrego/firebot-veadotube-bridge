// Base Types

export type SentInstanceMessage = { channel: "instance", json: SentInstanceJson };
export type ReceivedInstanceMessage = { channel: "instance", json: ReceivedInstanceJson };

export type SentNodesMessage = { channel: "nodes",    json: SentNodesJson };
export type ReceivedNodesMessage = { channel: "nodes",    json: ReceivedNodesJson };

// Base Unions

type AnyMessage =
  | SentMessage
  | ReceivedMessage;

type AnyJson =
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

type ReceivedStateEventListPayload = {
    event: "list";
    states: StateEvent[]
  }
type ReceivedStateEventThumbPayload = {
    event: "thumb";
    state: string;
    hash: string | undefined;
    width: number | undefined;
    height: number | undefined;
    png: string | undefined;
  }
type ReceivedStateEventPeekPayload = {
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
  | string

// Parsing Functions

export function parseMessage(input: string): ReceivedMessage {
  const separator = input.indexOf(":");

  if (separator === -1) {
    throw new Error("Invalid message");
  }

  const channel = input.slice(0, separator).trim();
  const json = JSON.parse(input.slice(separator + 1).trim());

  switch (channel) {
    case "instance":
      return {
        channel: "instance",
        json: json as ReceivedInstanceJson
      }
    case "nodes":
      return {
        channel: "nodes",
        json: json as ReceivedNodesJson
      }
    default:
      throw new Error(`Unknown channel for message: ${channel}: ${JSON.stringify(json)}`)
  }
}

// Unused, but could be useful in the future.
export function matchReceivedtoSent(message: ReceivedMessage): SentMessage {
  let match: any = {};
  match.json = {};

  if (message.channel === "instance") {
    match.channel = "instance";
    if (message.json.event === "info") {
      match.json.event = "info";
      return match as SentMessage;
    }
  }
  if (message.channel === "nodes") {
    match.channel = "nodes";
    if (message.json.event === "list") {
      match.json.event = "list";
      return match as SentMessage;
    }
    else if (message.json.event === "payload") {
      match.json.event = "payload";
      match.json.type = message.json.type;
      match.json.id = message.json.id;
      match.json.payload = {};
      if (message.json.type === "boolean" ||
          message.json.type === "number") {
        match.json.payload.event = "get";
        return match as SentMessage;
      }
      else if (message.json.type === "stateEvents") {
        if (message.json.payload.event === "list") {
          match.json.payload.event = "list";
          return match as SentMessage;
        }
        else if (message.json.payload.event === "thumb") {
          match.json.payload.event = "thumb";
          match.json.payload.state = message.json.payload.state;
          return match as SentMessage;
        }
        else if (message.json.payload.event === "peek") {
          match.json.payload.event = "peek";
          return match as SentMessage;
        }
      }
    }
  }
  throw new Error(`Unknown message: ${message.channel}: ${JSON.stringify(message.json)}`)
}

export function createMessage(message: SentMessage): string {
  return `${message.channel}: ${JSON.stringify(message.json)}`
}

// Creates a message key of the forms:
// - "channel:event",
// - "channel:event:id:type:request"
// - "nodes:payload:id:state:thumb:<state-id>"
export function messageKey(message: AnyMessage): string {
  let key = `${message.channel}:${message.json.event}`;

  if (message.channel === "nodes") {
    if (message.json.event === "payload") {
      key += `:${message.json.id}:${message.json.type}`;
      if (message.json.type === "boolean" || message.json.type === "number") {
        key += `:get`;
      }
      else if (message.json.type === "stateEvents") {
        key += `:${message.json.payload.event}`;
        if (message.json.payload.event === "thumb") {
          key += `:${message.json.payload.state}`;
        }
      }
    }
  }
  return key;
}

export function nodeKey(node: Node): string {

  let key = `${node.type}:${node.id}`;
  return key;
}

export function cleanPayload(message: ReceivedMessage): CleanedPayload {
  if (message.channel === "instance") {
    return message.json.name;
  }
  else if (message.channel === "nodes") {
    if (message.json.event === "payload") {
      if (message.json.type === "boolean") {
        return message.json.payload ?? false;
      }
      else if (message.json.type === "number") {
        return message.json.payload.value ?? 0;
      }
      else if (message.json.type === "stateEvents") {
        if (message.json.payload.event === "list") {
          return message.json.payload.states
                        .map(state => state.id)
                        .join(",");
        }
        else if (message.json.payload.event === "peek") {
          return message.json.payload.state ?? "";
        }
        else if (message.json.payload.event === "thumb") {
          return message.json.payload.png ?? "";
        }
      }
    }
  }

  throw new Error(`Unknown message: ${message.channel}: ${JSON.stringify(message.json)}`);
}
