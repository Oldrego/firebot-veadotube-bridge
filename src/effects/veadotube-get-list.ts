import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = {
  instanceName: string;
};

export const getListEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:get-list",
    name: "Veadotube: Get List",
    description: "Gets the list of websocket nodes in an instance",
    icon: "fas fa-question-circle",
    categories: ["integrations"],
    dependencies: { integrations: { veadotube: true } },
    outputs: [
      {
        label: "List",
        description: "The list of nodes as an object",
        defaultName: "list"
      },
      {
        label: "List As Text",
        description: "The list of nodes as text",
        defaultName: "text"
      }
    ]
  },
  optionsTemplate: `
    <eos-container header="Instance Name">
      <input type="text" class="form-control" ng-model="effect.instanceName"
             placeholder="Leave blank to use the first connected instance">
    </eos-container>
  `,
  onTriggerEvent: async ({ effect }) => {
    const instance = effect.instanceName
      ? veadotubeController.manager?.getInstance(effect.instanceName)
      : veadotubeController.manager?.getInstances()[0];

    if (!instance) {
      effect.instanceName
        ? firebot.logger.info(`Instance named ${effect.instanceName} not found`)
        : firebot.logger.info(`Instance not found`);
      return { success: false, outputs: { list: [], text: "" } };
    }

    try {
      var response = await instance.getNodes();
      var text = `${response.map((node) => `{${node.id}, ${node.name}, ${node.type}}`).join(`,\n`)}`
      firebot.logger.info(`[${effect.type}]: ${instance.name} has:\n${text}`);
    }
    catch (error) {
      firebot.logger.info(
        `${error}
        ${instance.name} may have no websocket nodes.`);
      return { success: false, outputs: { list: [], text: "" } };
    }

    return {
      success: true,
      outputs: {
        list: response,
        text
      }
    };
  }
};
