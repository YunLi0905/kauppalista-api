const express = require("express")
const router = express.Router()

router.get("/", (req, res, next) => {
  res.status(500).json({ message: "not yet implemented!" })
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
