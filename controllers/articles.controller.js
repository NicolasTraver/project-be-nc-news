const {
  fetchArticleById,
  fetchArticles,
  fetchArticleComment,
} = require("../models/articles.model");

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    const article = await fetchArticleById(article_id);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getArticles = async (req, res, next) => {
  try {
    const articles = await fetchArticles();
    res.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
};

exports.getArticleComment = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    await fetchArticleById(article_id); //check if article exists
    const comments = await fetchArticleComment(article_id);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};
