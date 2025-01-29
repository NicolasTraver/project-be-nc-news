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

exports.fetchArticles = async (req, res, next) => {
  const queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic,
    articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comments.comment_id) AS comment_count FROM articles JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`;

  const result = await db.query(queryStr);
  return result.rows;
};

exports.fetchArticleComment = async (article_id) => {
  //req, res, next
  //const { article_id } = req.params; //extract
  const queryS = `SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC; `;

  const { rows } = await db.query(queryS, [article_id]);
  return rows;
};
