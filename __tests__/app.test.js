const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

const app = require("../models/app");

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
    expect(body.msg).toBe("Invalid ArticleID");
  });
});
