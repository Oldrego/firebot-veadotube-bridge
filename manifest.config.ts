import packageJson from "./package.json" with { type: 'json' };

/*
* Used to make the plugin manifest and pass around constant values.
* Edit package.json instead for versioning.
*/

const manifest = {
  name: `Firebot-Veadotube Bridge`,
  author: packageJson.author,
  description: packageJson.description,
  version: packageJson.version,
  downloadUrl: `https://github.com/Oldrego/firebot-veadotube-bridge/releases/download/v${packageJson.version}/Firebot-Veadotube-Bridge.js`,
  // sha256,
  // releaseDate,
  type: `single-file`,
  icon: {
    type: "custom" as const,
    url: "https://github.com/Oldrego/firebot-veadotube-bridge/blob/main/src/assets/firedeer.png?raw=true",
    backgroundColor: "#FFFBD5"
  },
  category: `tools-utilities`,
  features: [
    `effects`,
    `events`,
    `integrations`
  ],
  repo: `https://github.com/Oldrego/firebot-veadotube-bridge`,
  minimumFirebotVersion: { major: 5, minor: 67 },

  other: { // Not part of manifest.json
    pluginOutputName: packageJson.pluginOutputName
  }
}

export default manifest;
