export const env = process.env.ENVIRONMENT ?? "local";
export const isDevelopment = env.startsWith("development");
export const config = {
  // This is invisv's test deployment value
  vpaas: "vpaas-magic-cookie-4c6a7be7b42f4dbab6b3792a9b38fb6c",
  webrtc_domain: "stage.8x8.vc",
};

export const isProduction = env === "production";
