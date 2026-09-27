import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = {
  instanceName: string;
  nodeId: string;
  value: number | string;
  min?: number | string | null;
  max?: number | string | null;
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
      <input type="text" class="form-control" ng-model="effect.value" replace-variables>
    </eos-container>

    <eos-container header="Range (optional)" pad-top="true">
      <div class="row">
        <div class="col-sm-6">
          <input type="text" class="form-control" ng-model="effect.min" placeholder="Minimum" replace-variables>
        </div>
        <div class="col-sm-6">
          <input type="text" class="form-control" ng-model="effect.max" placeholder="Maximum" replace-variables>
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
    if (!effect.value) {
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

    // I realize now, my hubris
    // (Allowing for replacement with variables requires validation)

    const value = Number(effect.value);

    const min = effect.min != null && effect.min !== ""
      ? Number(effect.min)
      : undefined;

    const max = effect.max != null && effect.max !== ""
      ? Number(effect.max)
      : undefined;

    if (!Number.isFinite(value)) {
      firebot.logger.warn(`Invalid number value: ${effect.value}`);
      return { success: false };
    }

    if (min !== undefined && !Number.isFinite(min)) {
      firebot.logger.warn(`Invalid minimum: ${effect.min}`);
      return { success: false };
    }

    if (max !== undefined && !Number.isFinite(max)) {
      firebot.logger.warn(`Invalid maximum: ${effect.max}`);
      return { success: false };
    }

    try {
      instance.addNumber(
        effect.nodeId,
        value,
        // Angular doesn't use undefined?
        min,
        max
      );
      return {success: true};
    }
    catch (error) {
      firebot.logger.info(`${error}`)
      return {success: false};
    }
  }
};
