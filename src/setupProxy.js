const { createProxyMiddleware } = require("http-proxy-middleware");

// Dev proxy for /api (vercel.json does the same in production)
module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.DEV_API_URL || "http://localhost:5000",
      changeOrigin: false,
      logLevel: "warn",
    })
  );
};
