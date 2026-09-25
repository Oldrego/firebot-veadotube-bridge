import { getBooleanEffect } from "./veadotube-get-boolean-node";
import { setBooleanEffect } from "./veadotube-set-boolean-node";
import { toggleBooleanEffect } from "./veadotube-toggle-boolean-node";
import { clearBooleanEffect } from "./veadotube-clear-boolean-node";
import { getNumberEffect } from "./veadotube-get-number-node";
import { setNumberEffect } from "./veadotube-set-number-node";
import { addNumberEffect } from "./veadotube-add-number-node";
import { clearNumberEffect } from "./veadotube-clear-number-node";
import { listStatesEffect } from "./veadotube-list-states-node";
import { getStateThumbnailEffect } from "./veadotube-thumb-states-node";
import { peekStateEffect } from "./veadotube-peek-states-node";
import { setStateEffect } from "./veadotube-set-states-node";
import { pushStateEffect } from "./veadotube-push-states-node";
import { popStateEffect } from "./veadotube-pop-states-node";
import { toggleStateEffect } from "./veadotube-toggle-states-node";
import { clearStatesEffect } from "./veadotube-clear-states-node";
import { marryStateEffect } from "./veadotube-marry-states-node";


export const veadotubeEffects = [
  getBooleanEffect,
  setBooleanEffect,
  toggleBooleanEffect,
  clearBooleanEffect,
  getNumberEffect,
  setNumberEffect,
  addNumberEffect,
  clearNumberEffect,
  listStatesEffect,
  getStateThumbnailEffect,
  peekStateEffect,
  setStateEffect,
  pushStateEffect,
  popStateEffect,
  toggleStateEffect,
  clearStatesEffect,
  marryStateEffect
]
