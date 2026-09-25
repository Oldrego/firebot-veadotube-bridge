import type { EffectType } from "@crowbartools/firebot-types";
import { veadotubeController } from "../integration";
import firebot from "@crowbartools/firebot-types";

type Model = {
  instanceName: string;
  nodeId: string;
  value: string;
};

export const marryStateEffect: EffectType<Model> = {
  definition: {
    id: "veadotube:marry-state",
    name: "Veadotube: Marry State",
    description: "Betroths you to a state events node in veadotube",
    icon: "fas fa-heart",
    categories: ["integrations"],
    dependencies: { integrations: { veadotube: true } }
  },
  optionsTemplate: `
    <eos-container header="Congratulations" pad-top="true">
    <p>Welcome to Matrimony</p>
    </eos-container>
  `,
  onTriggerEvent: async () => {
    return {success: true};
  }
};

// You can truly do anything with states nodes in Veadotube
