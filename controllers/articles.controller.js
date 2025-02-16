const {
  fetchArticleById,
  fetchArticles,
  fetchArticleComment,
  addCommentToArticle,
  updateArticleVotes,
} = require("../models/articles.model");

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  if (article === null) {
    return res.status(404).send({ message: "Article not found" });
  }

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

  if (isNaN(article_id)) {
    return res.status(400).send({ message: "Invalid article ID" });
  }

  try {
    // Ensure the article exists
    const article = await fetchArticleById(article_id);

    // FIX: If article does not exist, return 404
    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }

    // Fetch comments for the article
    const comments = await fetchArticleComment(article_id);

    // FIX: Always return 200, even if comments array is empty
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    console.log("Missing username or body");
    return res.status(400).send({ msg: "Username and body are required." });
  }
  try {
    const newComment = await addCommentToArticle(article_id, username, body);
    res.status(201).send({ comment: newComment });
  } catch (err) {
    if (err.status) {
      res.status(err.status).send({ msg: err.msg });
    } else {
      next(err); // Pass unexpected errors to the global error handler
    }
  }
};

exports.patchArticleVotes = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.params;

  try {
    const updatedArticle = await updateArticleVotes(article_id, inc_votes);
    res.status(200).send({ article: updateArticle });
  } catch (err) {
    next(err);
  }
};
