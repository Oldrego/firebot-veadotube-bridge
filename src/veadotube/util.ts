import {
  ReceivedMessage,
  ReceivedInstanceJson,
  ReceivedNodesJson,
  SentMessage,
  AnyMessage,
  Node,
  CleanedPayload
} from "../types/message"

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

export function cleanBool(value: unknown): boolean | undefined {
  if (value === true || value === "true" || value === 1 || value === "1") return true;

  if (value === false || value === "false" || value === 0 || value === "0") return false;

  return undefined;
}
