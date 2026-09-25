import firebot, { Plugin } from "@crowbartools/firebot-types";
import { veadotubeEventSources } from "./events/index";
import { veadotubeIntegration } from "./integration";
import { veadotubeEffects } from "./effects/index";
import { veadotubeFilters } from "./events/index";


type Params = {
  message: string;
};

const plugin: Plugin<Params> = {
  manifest: {
    name: "Firebot-Veadotube Bridge",
    description: "A plugin that allows for Firebot to affect websocket nodes in Veadotube",
    icon: {
      type: "font-awesome",
      name: "fa-paw",
      color: "#AD1818",
    },
    version: "1.0.0",
    author: "Oldrego",
    minimumFirebotVersion: { major: 5, minor: 67 }
  },
  registers: {
    integrations: [veadotubeIntegration],
    eventSources: veadotubeEventSources,
    effects: veadotubeEffects,
    filters: veadotubeFilters
  }
};

export default plugin;
