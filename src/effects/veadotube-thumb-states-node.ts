import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = { instanceName: string; nodeId: string; value: string; };

export const getStateThumbnailEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:thumb-state",
    name: "Veadotube: Get State Thumbnail",
    description: "Gets the thumbnail of a state events node's state in veadotube",
    icon: "fas fa-list-alt",
    categories: ["integrations"],
    dependencies: { integrations: { veadotube: true } },
    outputs: [
      {
        label: "Thumbnail Hash",
        description: "The state's image as a hash",
        defaultName: "hash"
      },
      {
        label: "Thumbnail Width",
        description: "The node's set minimum range",
        defaultName: "width"
      },
      {
        label: "Thumbnail Height",
        description: "The node's set maximum range",
        defaultName: "height"
      },
      {
        label: "Thumbnail Png",
        description: "The node's image as a base64 encoded png",
        defaultName: "png"
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
      return {
        success: false,
        outputs: {
          hash: undefined,
          width: undefined,
          height: undefined,
          png: undefined
        }
      };
    }

    try {
      var response = await instance.getStateThumbnail(effect.nodeId, effect.value);
    }
    catch (error) {
      firebot.logger.info(`${error}`);
      return {
        success: false,
        outputs: {
          hash: undefined,
          width: undefined,
          height: undefined,
          png: undefined
        }
      };
    }

    return {
      success: true,
      outputs: {
        hash: response.hash,
        width: response.width,
        height: response.height,
        png: response.png
      }
    };
  }
};
