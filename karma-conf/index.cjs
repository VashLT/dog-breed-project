var relativePath = "../";
var coveragePath = relativePath + "coverage";
module.exports = function (config) {
  return {
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-coverage"),
      require("karma-junit-reporter"),
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
      require("karma-coverage-istanbul-reporter"),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    reporters: ["progress", "kjhtml", "junit", "coverage-istanbul"],
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, relativePath + coveragePath + "/"),
      subdir: ".",
      reports: ["html", "lcov", "text-summary", "cobertura"],
      "report-config": {
        html: {
          type: "html",
          subdir: "html-report",
        },
        lcov: {
          type: "lcov",
          subdir: "lcov-report",
        },
        "text-summary": {
          type: "text-summary",
          file: "text-report/coverage.txt",
        },
        cobertura: {
          type: "cobertura",
          file: "cobertura-report/cobertura.xml",
        },
      },
      fixWebpackSourcePaths: true,
    },
    junitReporter: {
      outputDir: require("path").join(__dirname, relativePath + coveragePath + "/junit-report"),
      outputFile: "junit.xml",
      suite: "",
      useBrowserName: false,
      nameFormatter: undefined,
      classNameFormatter: undefined,
      properties: {},
      xmlVersion: null,
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadless"],
    customLaunchers: {
      ChromeHeadless: {
        base: "Chrome",
        flags: [
          "--no-sandbox",
          "--headless",
          "--disable-gpu",
          "--remote-debugging-port=9222",
        ],
      },
    },
    singleRun: true,
    restartOnFileChange: true,
  };
};
