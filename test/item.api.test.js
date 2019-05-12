const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const supertest = require("supertest")
const { app } = require("../src/app")
const api = supertest(app)
const db = new MongoMemoryServer()
const { ItemModel } = require("../src/model")
const data = require("./dummy.data")

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

beforeEach(async () => {
  //clear database,poista kaikki
  await ItemModel.deleteMany().exec()
  // fill in dummy data
  await Promise.all(
    data.items.map(item => new ItemModel(item)).map(item => item.save())
  )
})

describe(`GET ${URI}`, () => {
  it("returns all items in database as JSON with 200", async () => {
    const expectedItems = await ItemModel.find().exec()
    const expectedIds = expectedItems.map(item => item._id.toString())
    const { body } = await api
      .get(URI)
      .expect(200)
      .expect("content-type", /application\/json/)

    expect(body.length).toBe(expectedItems.length)
    body.map(item => expect(expectedIds).toContain(item._id))
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
