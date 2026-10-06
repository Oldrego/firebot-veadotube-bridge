import firebot from "@crowbartools/firebot-types";
import type { ReplaceVariable } from "@crowbartools/firebot-types";
import { nodeEventData, nodeListEventData } from "../types/data";
import { nodeChanged, nodeListChanged } from "../events/source";

export const nodeVariable: ReplaceVariable = {
  definition: {
    handle: "node",
    usage: "node",
    description: "The node id of the event",
    categories: ["trigger based"],
    triggers: {
      event: [
        `${nodeChanged.eventSourceId}:${nodeChanged.eventId}`,
        `${nodeListChanged.eventSourceId}:${nodeListChanged.eventId}`
      ]
    },
    possibleDataOutput: ["text"]
  },

  evaluator: (trigger) => {
    const eventData = trigger.metadata.eventData as nodeEventData | nodeListEventData;
    return eventData.nodeId;
  }
}
