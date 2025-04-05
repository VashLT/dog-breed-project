// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

var baseConfig = require("./karma-conf/index.cjs");
module.exports = function (config) {
  var configBase = baseConfig(config);
  configBase.coverageReporter = {
    dir: require("path").join(__dirname, "./coverage"),
    subdir: ".",
    reports: ["html", "lcovonly", "text-summary"],
    fixWebpackSourcePaths: true,
  };
  configBase.singleRun = false;
  config.set(configBase);
};
