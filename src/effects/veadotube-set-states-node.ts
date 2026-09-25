import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = {
  instanceName: string;
  nodeId: string;
  value: string;
};

export const setStateEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:set-state",
    name: "Veadotube: Set State",
    description: "Set a state events node's state in veadotube",
    icon: "fas fa-list-alt",
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

    <eos-container header="State Id" pad-top="true">
      <input type="text" class="form-control" ng-model="effect.value">
    </eos-container>
  `,
  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (!effect.nodeId) {
      errors.push("Please enter a node Id.");
    }
    if (typeof effect.value !== "string") {
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

    instance.setState(
      effect.nodeId,
      effect.value
    );
    return {success: true};
  }
};
