import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import { cleanBool } from "../veadotube/util";
import firebot from "@crowbartools/firebot-types";

type Model = { instanceName: string; nodeId: string; value: boolean | string };

export const setBooleanEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:set-boolean",
    name: "Veadotube: Set Boolean",
    description: "Set a boolean node's value in veadotube",
    icon: "fas fa-toggle-on",
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
    <eos-container header="Value" pad-top="true">
      <input type="text" class="form-control" ng-model="effect.value" replace-variables>
    </eos-container>
  `,
  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (!effect.nodeId) {
      errors.push("Please enter a node Id.");
    }
    if (!effect.value) {
      errors.push("Please enter a value.");
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

    let value = cleanBool(effect.value);

    if (value === undefined) {
      firebot.logger.warn(`Invalid boolean value: ${effect.value}`);
      return { success: false }
    }

    instance.setBoolean(effect.nodeId, value);
    return { success: true };
  }
};
