const tap = require("tap");
const supertest = require("supertest");
const app = require("../app");

// Helper to prepend /api/v1 to all paths
const server = {
  post: (path) => supertest(app).post(`/api/v1${path}`),
  get: (path) => supertest(app).get(`/api/v1${path}`),
  put: (path) => supertest(app).put(`/api/v1${path}`),
  delete: (path) => supertest(app).delete(`/api/v1${path}`),
};

const mockUser = {
  name: "Clark Kent",
  email: "clark@superman.com",
  password: "Krypt()n8",
  preferences: ["movies", "comics"],
};

let token = "";

// Auth tests

tap.test("POST /auth/register", async (t) => {
  const response = await server.post("/auth/register").send(mockUser);
  t.equal(response.status, 201);
  t.end();
});

tap.test("POST /auth/register with missing email", async (t) => {
  const response = await server.post("/auth/register").send({
    name: mockUser.name,
    password: mockUser.password,
  });
  t.equal(response.status, 400);
  t.end();
});

tap.test("POST /auth/login", async (t) => {
  const response = await server.post("/auth/login").send({
    email: mockUser.email,
    password: mockUser.password,
  });
  t.equal(response.status, 200);
  t.hasOwnProp(response.body.data, "token");
  token = response.body.data.token;
  t.end();
});

tap.test("POST /auth/login with wrong password", async (t) => {
  const response = await server.post("/auth/login").send({
    email: mockUser.email,
    password: "wrongpassword",
  });
  t.equal(response.status, 401);
  t.end();
});

// Preferences tests

tap.test("GET /users/preferences", async (t) => {
  const response = await server
    .get("/users/preferences")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.hasOwnProp(response.body.data, "preferences");
  t.same(response.body.data.preferences, mockUser.preferences);
  t.end();
});

tap.test("GET /users/preferences without token", async (t) => {
  const response = await server.get("/users/preferences");
  t.equal(response.status, 401);
  t.end();
});

tap.test("PUT /users/preferences", async (t) => {
  const response = await server
    .put("/users/preferences")
    .set("Authorization", `Bearer ${token}`)
    .send({
      preferences: ["movies", "comics", "games"],
    });
  t.equal(response.status, 200);
});

tap.test("Check PUT /users/preferences", async (t) => {
  const response = await server
    .get("/users/preferences")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.same(response.body.data.preferences, ["movies", "comics", "games"]);
  t.end();
});

// News tests

tap.test("GET /news", async (t) => {
  const response = await server
    .get("/news")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "data");
  t.end();
});

tap.test("GET /news without token", async (t) => {
  const response = await server.get("/news");
  t.equal(response.status, 401);
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
