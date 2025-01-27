const { getTopics } = require("../controllers/topics.controllers");
const topicsRouter = require("express");
const db = require("../db/connection");

exports.fetchTopics = async () => {
  try {
    const { rows } = await db.query("SELECT * FROM topics");
    return rows;
  } catch (err) {
    throw new Error("Unable to fetch topics");
  }
};

//"SELECT slug, description FROM topics;"
