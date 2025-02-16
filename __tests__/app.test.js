const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

const app = require("../app");

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET/api/topics", () => {
  test("200: should respond with an array of properties each of which should have the following properties: slug and descripion", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        if (topics.length > 0) {
          topics.forEach((topic) => {
            expect(topic).toHaveProperty("slug");
            expect(topic).toHaveProperty("description");
          });
        } else {
          expect(topics).toHaveLength(0);
        }
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with article object containing the correct properties", async () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          author: expect.any(String),
          title: expect.any(String),
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("404: if article_id does not exist it should respond with an error", async () => {
    const { body } = await request(app).get("/api/articles/120");
    expect(body.msg).toBe("Article ID not found");
  });
  test("400: if article_id is invalid it should respond with error", async () => {
    const { body } = await request(app).get("/api/articles/oops").expect(400);
    expect(body.msg).toBe("Invalid Article ID");
  });
});

describe("GET /api/articles", () => {
  test("Responds to an array of articles in a sort_by_date descending order", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.articles).toBeInstanceOf(Array);
    //expect(body.articles).toHaveLength();//Adjust length

    body.articles.forEach((article) => {
      expect(article).toEqual(
        expect.objectContaining({
          //Can we use toMatchObject?
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(String),
        })
      );
    });
    expect(body.articles).toBeSortedBy("created_at", { descending: true });
  });
  test("should not include body property", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    body.articles.forEach((article) => {
      expect(article).not.toHaveProperty("body");
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: an array of comments for the given article_id of which each comment", async () => {
    const response = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);
    const { body } = response;
    expect(body.comments).toBeInstanceOf(Array);
    body.comments.forEach((comment) => {
      expect(comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: 1,
        })
      );
    });
  });

  test.skip("200: returns an empty array if there are no comments for the article", async () => {
    const response = await request(app)
      .get("/api/articles/999/comments")
      .expect(200);
    const { body } = response;
    expect(body.comments).toBeInstanceOf(Array);
    expect(body.comments.length).toBe(0);
  });

  test("404: returns an error if the article_id does not exist", async () => {
    const response = await request(app)
      .get("/api/articles/999/comments")
      .expect(404);

    expect(response.body.message).toBe("Article not found");
  });

  test("404: returns an error if the article_id is invalid", async () => {
    const response = await request(app)
      .get("/api/articles/invalid/comments")
      .expect(400);
    const { body } = response;
    expect(body.message).toBe("Invalid article ID");
  });
});

describe.only("POST /api/articles/:article_id/comments", () => {
  test("201: Should add a comment to article", async () => {
    const newComment = {
      username: "grumpy19",
      body: "Great comment for article",
    };

    const { body, status } = await request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201);
    console.log("Response Status:", status);
    console.log("Response Body:", body);
    expect(body.comment).toEqual(
      expect.objectContaining({
        comment_id: expect.any(Number),
        article_id: 1,
        author: "weegembump",
        body: "Great comment for article",
        created_at: expect.any(String),
      })
    );
  });
  test('404: Should respond with "Article not found" if the article does not exist', async () => {
    const newComment = {
      username: "happyamy2016",
      body: "Great comment for article",
    };

    const { body } = await request(app)
      .post("/api/articles/999/comments")
      .send(newComment)
      .expect(404);

    expect(body.msg).toBe("Article ID not found");
  });
  test('400: Should respond with "Bad Request" for invalid article_id', async () => {
    const newComment = {
      username: "happyamy2016",
      body: "Great comment for article",
    };

    const { body } = await request(app)
      .post("/api/articles/invalid/comments")
      .send(newComment)
      .expect(400);

    expect(body.msg).toBe("Invalid Article ID");
  });

  test('400: Should respond with "Bad Request" when request body is missing required fields', async () => {
    const newComment = {
      username: "happyamy2016",
    };

    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400);

    expect(body.msg).toBe("Username and body are required.");
  });

  test('400: Should respond with "Bad Request" when username does not exist', async () => {
    const newComment = {
      username: "nonexistent_user",
      body: "Great comment for article",
    };

    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400);

    expect(body.msg).toBe("Invalid username");
  });

  test('400: Should respond with "Bad Request" when body of comment is empty', async () => {
    const newComment = {
      username: "grumpy19",
      body: "",
    };

    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400);

    expect(body.msg).toBe("Username and body are required.");
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Should update the article's votes and return the updated article", async () => {
    const response = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 10 })
      .expect(200);

    expect(response.body.article).toMatchObject({
      article_id: 1,
      votes: expect.any(Number),
    });
    expect(response.body.article.votes).toBeGreaterThan(0);
  });

  test("400: Should return an error when inc_votes is missing", async () => {
    const response = await request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400);

    expect(response.body.msg).toBe(
      "inc_votes is required and must be a number"
    );
  });

  test("400: Should return an error when inc_votes is not a number", async () => {
    const response = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "ten" })
      .expect(400);

    expect(response.body.msg).toBe("inc_votes must be a number");
  });

  test("404: Should return an error when article_id does not exist", async () => {
    const response = await request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404);

    expect(response.body.msg).toBe("Article ID not found");
  });

  test("400: Should return an error when article_id is not a number", async () => {
    const response = await request(app)
      .patch("/api/articles/not-a-number")
      .send({ inc_votes: 1 })
      .expect(400);

    expect(response.body.msg).toBe("Invalid Article ID");
  });
});
