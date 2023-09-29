export const env = process.env.ENVIRONMENT ?? "local";
export const isDevelopment = env.startsWith("development");
export const config = {
  // This is invisv's test deployment value
  vpaas: "vpaas-magic-cookie-ffb7afc059534f0497e2ee68d9947e02",
  webrtc_domain: "8x8.vc",
};

export const isProduction = env === "production";
