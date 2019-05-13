/**
 * Create and configure express app instance
 */

const express = require("express")

const { itemRouter } = require("./routers")
const { errorHandler } = require("./post")

const app = express()

//add pre-processing middleware
//parses request body into json
app.use(express.json())

//add routers
app.use("/items", itemRouter)

//add post-processing middlewares

app.use(errorHandler)

module.exports = { app }
