const { model, Schema } = require("mongoose")

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    validate: {
      message: "must be positive number",
      validator: s => {
        return typeof s === "number" && s >= 1
      }
    }
  },
  done: {
    type: Boolean,
    default: false,
    required: true
  }
})

const ItemModel = model("item", schema)
module.exports = { ItemModel }
