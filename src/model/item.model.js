const { model, Schema } = require("mongoose")

const schema = new Schema({
  name: {
    type: String
  },
  quantity: {
    type: Number
  },
  done: {
    type: Boolean
  }
})

const ItemModel = model("item", schema)
module.exports = { ItemModel }
