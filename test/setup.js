const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const supertest = require("supertest")
const { app } = require("../src/app")

const api = supertest(app)
const db = new MongoMemoryServer()

if (process.env.NODE_ENV !== "test") {
  console.error("trying to run tests while not in test mode, aborting")
  process.exit(1)
}

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

module.exports = { api }
