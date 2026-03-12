// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const next = require("next");

const isDev = process.env.NODE_ENV !== "production";

const app = next({
  dev: isDev,
  dir: __dirname,            // functions/ is the runtime root
  conf: { distDir: ".next" } // expects functions/.next
});

const handle = app.getRequestHandler();

// Prepare ONCE per warm instance
const prepared = app.prepare();

exports.nextServer = onRequest(
  {
    region: "us-central1",
    // Optional but often helpful for SSR:
    timeoutSeconds: 60,
    memory: "1GiB",
    // You can also set concurrency, minInstances, etc. later if needed.
  },
  async (req, res) => {
    try {
      await prepared;
      return handle(req, res);
    } catch (err) {
      logger.error("Next SSR error:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);
