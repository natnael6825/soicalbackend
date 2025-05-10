const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../log.txt");

function logToFile(message) {
  const time = new Date().toISOString();
  const log = `[${time}] ${message}\n`;

  fs.appendFile(logFile, log, (err) => {
    if (err) console.error("Failed to write log:", err);
  });
}

module.exports = { logToFile };
