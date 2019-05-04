const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const supertest = require("supertest")
const { app } = require("../src/app")
const api = supertest(app)
const db = new MongoMemoryServer()

const URI = "/items"

beforeAll(async () => {
  const DB_URI = await db.getConnectionString()
  mongoose
    .connect(DB_URI, { useNewUrlParser: true })
    .then(() => console.log(`now connected to in-memory database at ${DB_URI}`))
    .catch(error => {
      console.error("error connecting to database", error)
      process.exit(1)
    })
})

afterAll(async () => {
  await mongoose.disconnect().then(() => db.stop())
  console.log("now disconnected from in-memory database")
})

describe(`GET ${URI}`, () => {
  it("returns 500", async () => {
    await api
      .get(URI)
      .expect(500)
      .expect("content-type", /application\/json/)
  })
})

describe(`GET ${URI}/:id`, () => {
  it("returns 500", async () => {
    await api
      .get(`${URI}/:id`)
      .expect(500)
      .expect("content-type", /application\/json/)
  })
})

describe(`POST ${URI}`, () => {
  it("returns 500", async () => {
    await api
      .post(URI)
      .expect(500)
      .expect("content-type", /application\/json/)
  })
})

describe(`PATCH ${URI}/:id`, () => {
  it("returns 500", async () => {
    await api
      .patch(`${URI}/:id`)
      .expect(500)
      .expect("content-type", /application\/json/)
  })
})

describe(`DELETE ${URI}`, () => {
  it("returns 500", async () => {
    await api
      .delete(`${URI}/:id`)
      .expect(500)
      .expect("content-type", /application\/json/)
  })
})
