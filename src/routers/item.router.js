const express = require("express")
const router = express.Router()
const { ItemModel } = require("../model")

router.get("/", async (req, res, next) => {
  const items = await ItemModel.find().exec()
  res.status(200).json(items)
})

router.get("/:id", (req, res, next) => {
  const { id } = req.params
  ItemModel.findById(id)
    .then(item => {
      if (!item) {
        res.status(404).json({ message: "oops, item not found" })
      } else {
        res.status(200).json(item)
      }
    })
    // .catch(error => next(error))
    .catch(next)
})

router.post("/", (req, res, next) => {
  const { done, ...rest } = req.body
  new ItemModel(rest)
    .save()
    .then(item => res.status(201).json(item))
    .catch(next)
})

router.patch("/:id", (req, res, next) => {
  const { id } = req.params

  ItemModel.findByIdAndUpdate(id, req.body, { runValidators: true })
    .then(item => {
      if (!item) {
        res.status(404).json({ message: "oops, item not found" })
      } else {
        res.status(200).json(item)
      }
    })
    .catch(next)
})

router.delete("/:id", (req, res, next) => {
  res.status(500).json({ message: "not yet implemented!" })
})

module.exports = { router }
