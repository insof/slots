
var config = require("./webpack.config.build.js");

// Dev server config

config.entry["game"].push("webpack-dev-server/client?http://localhost:8080");
config.devtool = 'eval-source-map';
config.devServer = { contentBase: __dirname };

module.exports = config;