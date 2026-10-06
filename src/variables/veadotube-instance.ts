import firebot from "@crowbartools/firebot-types";
import type { ReplaceVariable } from "@crowbartools/firebot-types";
import { nodeEventData, nodeListEventData, connectionEventData } from "../types/data";
import { nodeChanged, nodeListChanged, instanceConnectionChanged } from "../events/source";

export const instanceVariable: ReplaceVariable = {
  definition: {
    handle: "instance",
    usage: "instance",
    description: "The instance name of the event",
    categories: ["trigger based"],
    triggers: {
      event: [
        `${nodeChanged.eventSourceId}:${nodeChanged.eventId}`,
        `${nodeListChanged.eventSourceId}:${nodeListChanged.eventId}`,
        `${instanceConnectionChanged.eventSourceId}:${instanceConnectionChanged.eventId}`
      ]
    },
    possibleDataOutput: ["text"]
  },

  evaluator: (trigger) => {
    const eventData = trigger.metadata.eventData as nodeEventData | nodeListEventData | connectionEventData;
    return eventData.instanceName;
  }
}
