import { createRoot } from "react-dom/client";
import { App } from "./App";
import { env, isProduction, config } from "./environment";
import { miniLoadExternalApi } from "./jitsi/init";

import "./js/jwt-decode";

// these envvars are set by the EnvironmentPlugin in webpack.config.js
console.log(
  `!!! version ${process.env.GIT_VERSION} (${process.env.ENVIRONMENT})`
);

if (!isProduction) {
  document.title = env.toUpperCase() + " " + document.title;
}

// begin: invisv-integration
// deliberately don't wait for the resolution of the promise
// returned here - we'll await it only when we need to interact with
// the jitsi api.
// to speak directly to the JAAS, the first two parameters are "8x8.vc", ""
// the call below fetches the files locally from the /js directory
void miniLoadExternalApi(window.location.host, "", config.vpaas);
// end: invisv-integration

const rootNode = document.getElementById("root");

if (rootNode) {
  const root = createRoot(rootNode);
  root.render(<App />);
}
