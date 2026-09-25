import {
  instanceNameFilter,
  nodeIdFilter,
  typeFilter,
  addedOrRemovedFilter,
  booleanPayloadFilter,
  numberPayloadFilter,
  stateEventPayloadFilter
} from "./filters";

import { veadotubeEventSource } from "./source"

export const veadotubeFilters = [
  instanceNameFilter,
  nodeIdFilter,
  typeFilter,
  addedOrRemovedFilter,
  booleanPayloadFilter,
  numberPayloadFilter,
  stateEventPayloadFilter
];

export const veadotubeEventSources = [
  veadotubeEventSource
]
