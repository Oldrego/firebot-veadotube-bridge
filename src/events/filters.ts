import firebot from "@crowbartools/firebot-types";
import type { EventFilter } from "@crowbartools/firebot-types";
import {
  instanceConnectionChanged,
  nodeListChanged,
  nodeChanged,
} from "./source";
import { cleanBool } from "../veadotube/message";

export const instanceNameFilter: EventFilter = firebot.factories.eventFilters.createTextFilter({
  id: "veadotube:instance-name",
  name: "Instance Name",
  description: "Filter by the instance name",
  events: [
    instanceConnectionChanged,
    nodeListChanged,
    nodeChanged
  ],
  eventMetaKey: "instanceName"
});

export const nodeIdFilter: EventFilter = firebot.factories.eventFilters.createTextFilter({
  id: "veadotube:node-id",
  name: "Node Id",
  description: "Filter by the websocket node Id",
  events: [
    nodeListChanged,
    nodeChanged
  ],
  eventMetaKey: "nodeId"
});

export const typeFilter: EventFilter = firebot.factories.eventFilters.createPresetFilter({
  id: "veadotube:type",
  name: "Node Type",
  description: "Filter by the type of websocket node",
  events: [
    nodeListChanged,
    nodeChanged
  ],
  eventMetaKey: "nodeType",
  presetValues: () => [
    { value: "boolean", display: "Boolean Node" },
    { value: "number", display: "Number Node" },
    { value: "stateEvents", display: "State Events Node" }
  ]
});

export const addedOrRemovedFilter: EventFilter = firebot.factories.eventFilters.createPresetFilter({
  id: "veadotube:added-or-removed",
  name: "Change Type",
  description: "Filter by whether something was added or removed",
  events: [
    instanceConnectionChanged,
    nodeListChanged
  ],
  eventMetaKey: "changeType",
  presetValues: () => [
    { value: "added", display: "Added" },
    { value: "removed", display: "Removed" }
  ]
});

export const booleanPayloadFilter: EventFilter = {
  id: "veadotube:boolean-payload",
  name: "Boolean",
  description: "Filter by a boolean payload of a node change that occurred",
  events: [
    nodeChanged
  ],
  comparisonTypes: [
    "is",
    "is not" // funny
  ],
  valueType: "preset",
  // The preset values did not parse properly without a predicate
  presetValues: () => [
    {value: "true", display: "True"},
    {value: "false", display: "False"},
  ],
  predicate: (filterSettings, eventData) => {
    switch (filterSettings.comparisonType) {
      case "is":
        return cleanBool(filterSettings.value) === eventData.eventMeta.payload;
      case "is not":
        return cleanBool(filterSettings.value) !== eventData.eventMeta.payload;
      default:
        return false;
    }
  }
};

export const numberPayloadFilter: EventFilter = firebot.factories.eventFilters.createNumberFilter({
  id: "veadotube:number-payload",
  name: "Number",
  description: "Filter by a number payload of a node change that occurred",
  events: [
    nodeChanged
  ],
  eventMetaKey: "payload"
});

export const stateEventPayloadFilter: EventFilter = firebot.factories.eventFilters.createTextFilter({
  id: "veadotube:state-events-payload",
  name: "State",
  description: "Filter by a state payload of a node change that occurred",
  events: [
    nodeChanged
  ],
  eventMetaKey: "payload"
});
