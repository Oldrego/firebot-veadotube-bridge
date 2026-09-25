import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = { instanceName: string; nodeId: string; };

export const toggleBooleanEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:toggle-boolean",
    name: "Veadotube: Toggle Boolean",
    description: "Flips a boolean node's value in veadotube",
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
  `,
  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (!effect.nodeId) {
      errors.push("Please enter a node Id.");
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

    instance.toggleBoolean(effect.nodeId);
    return { success: true };
  }
};
