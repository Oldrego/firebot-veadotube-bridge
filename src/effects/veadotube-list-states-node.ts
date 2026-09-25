import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = { instanceName: string; nodeId: string; };

export const listStatesEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:list-states",
    name: "Veadotube: List States",
    description: "Gets a list of all states from a state events node in veadotube",
    icon: "fas fa-list-alt",
    categories: ["integrations"],
    dependencies: { integrations: { veadotube: true } },
    outputs: [
      {
        label: "States List",
        description: "A list of all states in veadotube",
        defaultName: "list"
      }
    ]
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
      return {
        success: false,
        outputs: {
          list: []
        }
      };
    }

    try {
      var response = await instance.listStates(effect.nodeId);
    }
    catch (error) {
      firebot.logger.info(`${error}`);
      return {
        success: false,
        outputs: {
          list: []
        }
      };
    }

    return {
      success: true,
      outputs: {
        list: response,
      }
    };
  }
};
