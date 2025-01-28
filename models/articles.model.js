const db = require("../db/connection");

exports.fetchArticleById = async (article_id) => {
  const query = `SELECT * FROM articles WHERE article_id = $1;`;
  const { rows } = await db.query(query, [article_id]);

  if (rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: "Article ID not found",
    });
  }
  return rows[0];
};
