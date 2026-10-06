import firebot from "@crowbartools/firebot-types";
import type { ReplaceVariable } from "@crowbartools/firebot-types";
import { nodeEventData } from "../types/data";
import { nodeChanged } from "../events/source";

export const payloadVariable: ReplaceVariable = {
  definition: {
    handle: "payload",
    usage: "payload",
    description: "The payload of the event",
    categories: ["trigger based"],
    triggers: {
      event: [
        `${nodeChanged.eventSourceId}:${nodeChanged.eventId}`
      ]
    },
    possibleDataOutput: ["bool", "number", "text"]
  },

  evaluator: (trigger) => {
    const eventData = trigger.metadata.eventData as nodeEventData;
    return eventData.payload;
  }
}
