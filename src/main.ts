import firebot, { Plugin } from "@crowbartools/firebot-types";
import { veadotubeEventSources } from "./events/index";
import { veadotubeIntegration } from "./integration";
import { veadotubeEffects } from "./effects/index";
import { veadotubeFilters } from "./events/index";
import manifest from "../manifest.config"

type Params = {
  message: string;
};

const plugin: Plugin<Params> = {
  manifest: {
    name: manifest.name,
    description: manifest.description,
    icon: manifest.icon,
    version: manifest.version,
    author: manifest.author,
    minimumFirebotVersion: manifest.minimumFirebotVersion
  },
  registers: {
    integrations: [veadotubeIntegration],
    eventSources: veadotubeEventSources,
    effects: veadotubeEffects,
    filters: veadotubeFilters
  }
};

export default plugin;
