const express = require("express")
const router = express.Router()
const { ItemModel } = require("../model")

router.get("/", async (req, res, next) => {
  const items = await ItemModel.find().exec()
  res.status(200).json(items)
})

router.get("/:id", (req, res, next) => {
  res.status(500).json({ message: "not yet implemented!" })
})
router.post("/", (req, res, next) => {
  res.status(500).json({ message: "not yet implemented!" })
})

router.patch("/:id", (req, res, next) => {
  res.status(500).json({ message: "not yet implemented!" })
})

router.delete("/:id", (req, res, next) => {
  res.status(500).json({ message: "not yet implemented!" })
})

module.exports = { router }
