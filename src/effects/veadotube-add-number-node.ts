import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = {
  instanceName: string;
  nodeId: string;
  value: number;
  min?: number | null;
  max?: number | null;
};

export const addNumberEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:add-number",
    name: "Veadotube: Add Number",
    description: "Adds a value to a number node's value in veadotube",
    icon: "fas fa-hashtag",
    categories: ["integrations"],
    dependencies: { integrations: { veadotube: true } }
  },
  optionsTemplate: `
    <eos-container header="Instance Name">
      <input type="text" class="form-control" ng-model="effect.instanceName"
             placeholder="Leave blank to use the first connected instance">
    </eos-container>

    <eos-container header="Node Id" pad-top="true">
      <input type="text" class="form-control" ng-model="effect.nodeId">
    </eos-container>

    <eos-container header="Added Value" pad-top="true">
      <input type="number" class="form-control" ng-model="effect.value" placeholder="0">
    </eos-container>

    <eos-container header="Range (optional)" pad-top="true">
      <div class="row">
        <div class="col-sm-6">
          <input type="number" class="form-control" ng-model="effect.min" placeholder="Minimum">
        </div>
        <div class="col-sm-6">
          <input type="number" class="form-control" ng-model="effect.max" placeholder="Maximum">
        </div>
      </div>
      <p class="muted" style="margin-top: 5px; font-size: 12px;">
        Fill in both or neither. Leave blank to send only the value.
      </p>
    </eos-container>
  `,
  optionsValidator: (effect) => {
    const errors: string[] = [];
    const hasMin = effect.min != null;
    const hasMax = effect.max != null;

    if (!effect.nodeId) {
      errors.push("Please enter a node Id.");
    }
    if (typeof effect.value !== "number") {
      errors.push("Please enter a value.");
    }
    if (hasMin !== hasMax) {
      errors.push("Set both min and max, or leave both blank.");
    } else if (hasMin && hasMax && effect.min! > effect.max!) {
      errors.push("Min can't be greater than max.");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    const instance = effect.instanceName
      ? veadotubeController.manager?.getInstance(effect.instanceName)
      : veadotubeController.manager?.getInstances()[0];

    if (!instance) {
      effect.instanceName
        ? firebot.logger.info(`Instance named ${effect.instanceName} not found`)
        : firebot.logger.info(`Instance not found`);
      return {success: false};
    }

    try {
      instance.addNumber(
        effect.nodeId,
        effect.value,
        // Angular doesn't use undefined?
        effect.min ?? undefined,
        effect.max ?? undefined
      );
      return {success: true};
    }
    catch (error) {
      firebot.logger.info(`${error}`)
      return {success: false};
    }
  }
};
