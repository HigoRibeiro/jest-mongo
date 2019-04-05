const request = require("supertest");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = function lazyApp() {
  return require("../../src/app");
};

const User = require("../../src/app/models/User");

const factory = require("../factories");

describe("Authentication", () => {
  let mongoServer;
  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    process.env.URI = await mongoServer.getUri();

    mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
  });

  afterAll(async done => {
    mongoose.disconnect(done);
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.remove({});
  });

  it("should authenticate with valid credentials", async () => {
    user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app())
      .post("/sessions")
      .send({
        email: user.email,
        password: "123123"
      });
    expect(response.status).toBe(200);
  });

  it("should not authenticate with invalid credentials", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app())
      .post("/sessions")
      .send({
        email: user.email,
        password: "123456"
      });

    expect(response.status).toBe(401);
  });

  it("should return jwt token when authenticated", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app())
      .post("/sessions")
      .send({
        email: user.email,
        password: "123123"
      });

    expect(response.body).toHaveProperty("token");
  });

  it("should be able to access private routes when authenticated", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app())
      .get("/dashboard")
      .set("Authorization", `Bearer ${User.generateToken(user)}`);

    expect(200).toBe(200);
  });

  it("should not be able to access private routes without jwt token", async () => {
    const response = await request(app()).get("/dashboard");

    expect(response.status).toBe(401);
  });

  it("should not be able to access private routes with invalid jwt token", async () => {
    const response = await request(app())
      .get("/dashboard")
      .set("Authorization", `Bearer 123123`);

    expect(response.status).toBe(401);
  });
});
