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
  it("returns the correct item as JSON with 200 if id exists", async () => {
    const items = await ItemModel.find().exec()
    const expectedItem = pickRandomFromArray(items)
    const { body } = await api
      .get(`${URI}/${expectedItem._id}`)
      .expect(200)
      .expect("content-type", /application\/json/)
    //
    expect(body._id).toBe(expectedItem._id.toString())
    expect(body.name).toBe(expectedItem.name)
    expect(body.quantity).toBe(expectedItem.quantity)
  })

  it("returns 404 if id does not exist", async () => {
    const items = await ItemModel.find().exec()
    const itemToDelete = pickRandomFromArray(items)
    const { _id } = itemToDelete
    await ItemModel.findByIdAndDelete(_id).exec()
    await api
      .get(`${URI}/${_id}`)
      .expect(404)
      .expect("content-type", /application\/json/)
  })

  it("returns 400 if id is invalid", async () => {
    await api
      .get(`${URI}/jsduhcoihcoaihcb`)
      .expect(400)
      .expect("content-type", /application\/json/)
  })
})

describe(`POST ${URI}`, () => {
  it("create a new item with given quantity and returns 201 if input is valid", async () => {
    const itemsBefore = await ItemModel.find().exec()
    //1.hae kaikki DB:sta
    const req = pickRandomFromArray(data.newItems)
    //2.lähetä req API:n kautta

    const { body } = await api
      .post(URI)
      .send(req)
      .expect(201)
      .expect("content-type", /application\/json/)

    expect(body.name).toBe(req.name)
    expect(body.quantity).toBe(req.quantity)
    const itemsAfter = await ItemModel.find().exec()
    expect(itemsAfter.length).toBe(itemsBefore.length + 1)
  })

  it("quantity defaults to 1 if not given in req", async () => {
    const itemsBefore = await ItemModel.find().exec()
    //1.hae kaikki DB:sta
    const { quantity, ...req } = pickRandomFromArray(data.newItems)
    //2.lähetä req API:n kautta

    const { body } = await api
      .post(URI)
      .send(req)
      .expect(201)
      .expect("content-type", /application\/json/)

    expect(body.name).toBe(req.name)
    expect(body.quantity).toBe(1)
    const itemsAfter = await ItemModel.find().exec()
    expect(itemsAfter.length).toBe(itemsBefore.length + 1)
  })

  it("ignores 'done' given in req, always defaults to false", async () => {
    const itemsBefore = await ItemModel.find().exec()
    //1.hae kaikki DB:sta
    const req = pickRandomFromArray(data.newItems)
    const _req = { ...req, done: true }

    //2.lähetä req API:n kautta

    const { body } = await api
      .post(URI)
      .send(_req)
      .expect(201)
      .expect("content-type", /application\/json/)

    expect(body.name).toBe(_req.name)
    expect(body.done).toBe(false)
    const itemsAfter = await ItemModel.find().exec()
    expect(itemsAfter.length).toBe(itemsBefore.length + 1)
  })

  it("fails and returns 400 if 'name' missing", async () => {
    const itemsBefore = await ItemModel.find().exec()
    //1.hae kaikki DB:sta

    //2.lähetä req API:n kautta
    const { name, ...req } = pickRandomFromArray(data.newItems)
    await api
      .post(URI)
      .send(req)
      .expect(400)
      .expect("content-type", /application\/json/)

    const itemsAfter = await ItemModel.find().exec()
    expect(itemsAfter.length).toBe(itemsBefore.length)
  })
})

describe(`PATCH ${URI}/:id`, () => {
  it("updates 'name' of item if id exists", async () => {
    const items = await ItemModel.find().exec()
    const itemToPatch = pickRandomFromArray(items)
    const { _id, name } = itemToPatch
    const patchedName = name + " patched"
    await api
      .patch(`${URI}/${_id}`)
      .send({ name: patchedName })
      .expect(200)
      .expect("content-type", /application\/json/)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.name).toBe(patchedName)
  })

  it("updates 'quantity' of item if id exists", async () => {
    const items = await ItemModel.find().exec()
    const itemToPatch = pickRandomFromArray(items)
    const { _id, quantity } = itemToPatch
    const patchedQuantity = quantity + 3
    await api
      .patch(`${URI}/${_id}`)
      .send({ quantity: patchedQuantity })
      .expect(200)
      .expect("content-type", /application\/json/)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.quantity).toBe(patchedQuantity)
  })

  it("updates both 'name' and 'quantity of item if id exists", async () => {
    const items = await ItemModel.find().exec()
    const itemToPatch = pickRandomFromArray(items)
    const { _id, name, quantity } = itemToPatch
    const patchedName = name + " patched"
    const patchedQuantity = quantity + 3
    await api
      .patch(`${URI}/${_id}`)
      .send({ name: patchedName, quantity: patchedQuantity })
      .expect(200)
      .expect("content-type", /application\/json/)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.name).toBe(patchedName)
    expect(patchedItem.quantity).toBe(patchedQuantity)
  })

  it("updates 'done' of item if id exists", async () => {
    const items = await ItemModel.find().exec()
    const itemToPatch = pickRandomFromArray(items)
    const { _id, done } = itemToPatch
    await api
      .patch(`${URI}/${_id}`)
      .send({ done: !done })
      .expect(200)
      .expect("content-type", /application\/json/)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.done).toBe(!done)
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

const pickRandomFromArray = arr => {
  const i = Math.floor(Math.random() * arr.length)
  return arr[i]
}
