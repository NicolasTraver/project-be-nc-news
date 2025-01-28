const express = require("express");
const { getTopics } = require("../controllers/topics.controllers");
const endpoints = require("../endpoints.json");
const { getArticleById } = require("../controllers/articles.controller");

const app = express();

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});
app.get("/api/topics", getTopics);

app.get(
  "/api/articles/:article_id",
  (req, res, next) => {
    const { article_id } = req.params;
    if (isNaN(Number(article_id))) {
      return res.status(400).send({ msg: "Invalid ArticleID" });
    }
    next();
  },
  getArticleById
);
//
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid articleID" });
  } else if (err.code) {
    res.status(404).send({ msg: "Article ID not found" });
  } else {
    res.status(500).send({ msg: "Internal server error" });
  }
});

module.exports = app;
