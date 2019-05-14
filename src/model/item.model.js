const { model, Schema } = require("mongoose")

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  done: {
    type: Boolean,
    default: false,
    set: _ => false
  }
})

const ItemModel = model("item", schema)
module.exports = { ItemModel }
