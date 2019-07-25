require("dotenv").config()
const { app } = require("./app")
const mongoose = require("mongoose")
const MODE = process.env.NODE_ENV

const PORT = process.env.PORT || 4000
const DB_URI = process.env.DB_URI
app.listen(PORT, () => {
  console.log(`express app now listening on port ${PORT} on ${MODE} mode`)
  mongoose
    .connect(DB_URI, { useNewUrlParser: true })
    .then(() => console.log(`now connected to external database at ${DB_URI}`))
    .catch(error => {
      console.error("error connecting to database", error)
      process.exit(1)
    })
})
