import type { EventSource } from "@crowbartools/firebot-types";

export const EVENT_SOURCE_ID = "oldrego-veadotube";
export const INSTANCE_CONNECTION_CHANGED_EVENT_ID = "instance-connection-changed";
export const NODE_LIST_CHANGED_EVENT_ID = "node-list-changed";
export const NODE_CHANGED_EVENT_ID = "node-changed";

export const instanceConnectionChanged = { eventSourceId: EVENT_SOURCE_ID, eventId: INSTANCE_CONNECTION_CHANGED_EVENT_ID };
export const nodeListChanged = { eventSourceId: EVENT_SOURCE_ID, eventId: NODE_LIST_CHANGED_EVENT_ID };
export const nodeChanged = { eventSourceId: EVENT_SOURCE_ID, eventId: NODE_CHANGED_EVENT_ID };

export const veadotubeEventSource: EventSource = {
  id: EVENT_SOURCE_ID,
  name: "Veadotube",
  description: "Events related to Veadotube Instances",
  events: [
    {
      id: INSTANCE_CONNECTION_CHANGED_EVENT_ID,
      name: "Instance Connection Changed",
      description: "A Veadotube instance was connected or disconnected",
      cached: false
    },
    {
      id: NODE_LIST_CHANGED_EVENT_ID,
      name: "Node List Changed",
      description: "The list of WebSocket nodes within a VeadoTube instance changed",
      cached: false
    },
    {
      id: NODE_CHANGED_EVENT_ID,
      name: "Node Changed",
      description: "A node within a VeadoTube instance changed",
      cached: false
    },
  ]
}
