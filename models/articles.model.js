const db = require("../db/connection");

exports.fetchArticleById = async (article_id) => {
  const query = `SELECT * FROM articles WHERE article_id = $1;`;
  const { rows } = await db.query(query, [article_id]);

  return rows.length ? rows[0] : null;
};

exports.fetchArticles = async () => {
  const queryStr = `
  SELECT articles.author, articles.title, articles.article_id, articles.topic,
  articles.created_at, articles.votes, articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;
`;

  const result = await db.query(queryStr);
  return result.rows;
};

exports.fetchArticleComment = async (article_id) => {
  const { rows } = await db.query(
    "SELECT * FROM comments WHERE article_id = $1",
    [article_id]
  );
  return Array.isArray(rows) ? rows : [];
};

exports.addCommentToArticle = async (article_id, username, body) => {
  const numericArticleId = Number(article_id);

  // Check if article_id is a valid number first
  if (isNaN(numericArticleId) || numericArticleId < 1) {
    return Promise.reject({ status: 400, msg: "Invalid Article ID" });
  }

  // Ensure username and body are provided and not empty
  if (!username || !body || body.trim() === "") {
    return Promise.reject({
      status: 400,
      msg: "Username and body are required.",
    });
  }

  // Check if the article exists
  const articleQuery = `SELECT * FROM articles WHERE article_id = $1`;
  const articleResult = await db.query(articleQuery, [numericArticleId]);
  if (articleResult.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Article ID not found" });
  }

  // Check if the username exists
  const userQuery = `SELECT * FROM users WHERE username = $1`;
  const userResult = await db.query(userQuery, [username]);
  if (userResult.rows.length === 0) {
    return Promise.reject({ status: 400, msg: "Invalid username" });
  }

  // Insert the comment
  const query = `
    INSERT INTO comments (article_id, author, body, votes, created_at)
    VALUES ($1, $2, $3, 0, NOW())
    RETURNING *;
  `;
  const { rows } = await db.query(query, [numericArticleId, username, body]);

  return rows[0];
};

exports.updateArticleVotes = async (article_id, inc_votes) => {
  const numericArticleId = Number(article_id);
  if (isNaN(numericArticleId) || numericArticleId < 1) {
    return Promise.reject({ status: 400, msg: "Invalid Article ID" });
  }

  if (inc_votes === undefined || typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "inc_votes is required and must be a number",
    });
  }

  const query = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
  `;

  const { rows } = await db.query(query, [inc_votes, numericArticleId]);

  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Article ID not found" });
  }
  return rows[0];
};
