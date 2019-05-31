const { api } = require("./setup")
const { ItemModel } = require("../src/model")
const data = require("./dummy.data")

const URI = "/items"

/**
 * Clear database and fill in dummy items before each test.
 */
beforeEach(async () => {
  await ItemModel.deleteMany().exec()
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

  let item

  beforeEach(async () => {
    item = await ItemModel.find().then(pickRandomFromArray)
  })

  const apiReturnsJsonWithStatus = (uri, status) => {
    return api
      .get(uri)
      .expect(status)
      .expect("content-type", /application\/json/)
  }

  it("returns the correct item as JSON with 200 if id exists", async () => {
    const { body } = await apiReturnsJsonWithStatus(`${URI}/${item._id}`, 200)
    expect(body._id).toBe(item._id.toString())
    expect(body.name).toBe(item.name)
    expect(body.quantity).toBe(item.quantity)
  })

  it("returns 404 if id does not exist", async () => {
    await ItemModel.findByIdAndDelete(item._id).exec()
    await apiReturnsJsonWithStatus(`${URI}/${item._id}`, 404)
  })

  it("returns 400 if id is invalid", async () => {
    await apiReturnsJsonWithStatus(`${URI}/jsduhcoihcoaihcb`, 400)
  })
})

describe(`POST ${URI}`, () => {

  let itemsBefore

  beforeEach(async () => {
    itemsBefore = await ItemModel.find().exec()
  })

  const apiReturnsJsonWithStatus = (req, status) => {
    return api
      .post(URI)
      .send(req)
      .expect(status)
      .expect("content-type", /application\/json/)
  }

  const numberOfItemsInDbEquals = howMany => {
    return ItemModel
      .countDocuments()
      .then(count => expect(count).toBe(howMany))
  }

  it("create a new item with given 'quantity' and returns 201 if input is valid", async () => {
    const req = pickRandomFromArray(data.newItems)
    const { body } = await apiReturnsJsonWithStatus(req, 201)

    expect(body.name).toBe(req.name)
    expect(body.quantity).toBe(req.quantity)
    await numberOfItemsInDbEquals(itemsBefore.length + 1)
  })

  it("'quantity' defaults to 1 if not given in req", async () => {
    const { quantity, ...req } = pickRandomFromArray(data.newItems)
    const { body } = await apiReturnsJsonWithStatus(req, 201)

    expect(body.name).toBe(req.name)
    expect(body.quantity).toBe(1)
    await numberOfItemsInDbEquals(itemsBefore.length + 1)
  })

  it("ignores 'done' given in req, always defaults to false", async () => {
    const req = pickRandomFromArray(data.newItems)
    const _req = { ...req, done: true }
    const { body } = await apiReturnsJsonWithStatus(_req, 201)

    expect(body.name).toBe(_req.name)
    expect(body.done).toBe(false)
    await numberOfItemsInDbEquals(itemsBefore.length + 1)
  })

  it("fails and returns 400 if 'name' missing", async () => {
    const { name, ...req } = pickRandomFromArray(data.newItems)
    await apiReturnsJsonWithStatus(req, 400)
    await numberOfItemsInDbEquals(itemsBefore.length)
  })

  it("fails if 'quantity' is less than 1", async () => {
    const req = pickRandomFromArray(data.newItems)
    await Promise.all(
      [0, -1, -13, 0.1].map(quantity => {
        const _req = { ...req, quantity }
        return apiReturnsJsonWithStatus(_req, 400)
      })
    )
    await numberOfItemsInDbEquals(itemsBefore.length)
  })

  it("fails if 'quantity' is not a number", async () => {
    const req = pickRandomFromArray(data.newItems)
    await Promise.all(
      ["1j", "aksj", "  ", null].map(quantity => {
        const _req = { ...req, quantity }
        return apiReturnsJsonWithStatus(_req, 400)
      })
    )
    await numberOfItemsInDbEquals(itemsBefore.length)
  })
})

describe(`PATCH ${URI}/:id`, () => {

  let item

  beforeEach(async () => {
    const items = await ItemModel.find().exec()
    item = pickRandomFromArray(items)
  })

  const apiReturnsJsonWithStatus = (uri, req, status) => {
    return api
      .patch(uri)
      .send(req)
      .expect(status)
      .expect("content-type", /application\/json/)
  }

  it("updates 'name' of item if id exists", async () => {
    const { _id, name } = item
    const patchedName = name + " patched"
    await apiReturnsJsonWithStatus(`${URI}/${_id}`, { name: patchedName }, 200)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.name).toBe(patchedName)
  })

  it("updates 'quantity' of item if id exists", async () => {
    const { _id, quantity } = item
    const patchedQuantity = quantity + 3
    await apiReturnsJsonWithStatus(`${URI}/${_id}`, { quantity: patchedQuantity }, 200)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.quantity).toBe(patchedQuantity)
  })

  it("updates 'done' of item if id exists", async () => {
    const { _id, done } = item
    await apiReturnsJsonWithStatus(`${URI}/${_id}`, { done: !done }, 200)

    const patchedItem = await ItemModel.findById(_id).exec()
    expect(patchedItem.done).toBe(!done)
  })

  it("returns 404 if id does not exist", async () => {
    const { _id } = item
    await ItemModel.findByIdAndDelete(_id).exec()
    await apiReturnsJsonWithStatus(`${URI}/${_id}`, { quantity: 112 }, 404)
  })

  it("returns 400 if id is invalid", async () => {
    await apiReturnsJsonWithStatus(`${URI}/jsduhcoihcoaihcb`, { quantity: 112 }, 400)
  })

  it("fails if trying to patch empty name", async () => {
    const { _id } = item
    await Promise.all(
      [null, "", "  "].map(name => {
        return apiReturnsJsonWithStatus(`${URI}/${_id}`, { name }, 400)
      })
    )
  })

  it("fails if trying to patch invalid quantity", async () => {
    const { _id } = item
    await Promise.all(
      [null, "", "  ", 0, -1, 0.1, "hello"].map(quantity => {
        return apiReturnsJsonWithStatus(`${URI}/${_id}`, { quantity }, 400)
      })
    )
  })

  it("fails if trying to patch non-boolean done", async () => {
    const { _id } = item
    await Promise.all(
      [null, "", "  ", -1, 0.1, "hello"].map(done => {
        return apiReturnsJsonWithStatus(`${URI}/${_id}`, { done }, 400)
      })
    )
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
