require("dotenv").config();
const http = require("http");

const options = {
  timeout: 2000,
  host: "localhost",
  port: process.env.SERVER_PORT || 3000,
  path: "/status/health", // must be the same as HEALTHCHECK in Dockerfile
};

const request = http.request(options, (res) => {
  console.info("STATUS: " + res.statusCode);
  process.exitCode = res.statusCode === 200 ? 0 : 1;
  process.exit();
});

request.on("error", function (err) {
  console.error("ERROR", err);
});

request.end();
