const express = require("express");
const { getTopics } = require("../controllers/topics.controllers");
const endpoints = require("../endpoints.json");

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  //console.log("GET API ROUTE REACHED <<<<< ");
  res.status(200).send({ endpoints });
});
app.get("/api/topics", getTopics);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal server error" });
  }
});

module.exports = app;
