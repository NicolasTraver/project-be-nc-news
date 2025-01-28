const { fetchArticleById } = require("../models/articles.model");

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    const article = await fetchArticleById(article_id);
    if (!article) {
      return next({ status: 404, msg: "Article ID not found" });
    }
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};
