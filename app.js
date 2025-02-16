const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const endpoints = require("./endpoints.json");

const {
  getArticleById,
  getArticles,
  getArticleComment,
  addComment,
  patchArticleVotes,
} = require("./controllers/articles.controller");

const app = express();
app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});
app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComment);

app.post("/api/articles/:article_id/comments", addComment);
app.patch("/api/articles/:article_id", patchArticleVotes);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Article ID" });
  } else if (err.status === 404 && err.msg === "Article ID not found") {
    res.status(404).send({ msg: "Article ID not found" });
  } else {
    res.status(500).send({ msg: "Internal server error" });
  }
});

module.exports = app;
