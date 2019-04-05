const express = require("express");
const mongoose = require("mongoose");
const databaseConfig = require("./config/database");

class AppController {
  constructor() {
    this.express = express();

    this.database();
    this.middlewares();
    this.routes();
  }

  database() {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true
    });
  }

  middlewares() {
    this.express.use(express.json());
  }

  routes() {
    this.express.use(require("./routes"));
  }
}

module.exports = new AppController().express;
