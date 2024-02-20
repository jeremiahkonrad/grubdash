const crypto = require("crypto");

// Function that creates a random string to be used as an ID
function nextId() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = nextId;
