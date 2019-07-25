/**
 * Create and configure express app instance
 */

const express = require("express")
const path = require("path")

const { itemRouter } = require("./routers")
const { errorHandler } = require("./post")

const app = express()

// set static resources path
app.use(express.static(path.resolve(__dirname, "..", "public")))

//add pre-processing middleware
//parses request body into json
app.use(express.json())

//add routers
app.use("/items", itemRouter)

//add post-processing middlewares

app.use(errorHandler)

module.exports = { app }
