/**
 * functions/index.js
 *
 * Root export file for Firebase Functions.
 * Re-exports grouped function modules.
 */

const { setGlobalOptions } = require("firebase-functions/v2")

setGlobalOptions({ maxInstances: 10 })

module.exports = {
  ...require("./server"),
  ...require("./emailTriggers"),
}