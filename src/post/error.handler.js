const errorHandler = (err, req, res, next) => {
  console.error(err)
  const { name } = err
  switch (name) {
    case "CastError": {
      return res.status(400).json(err)
    }
    case "ValidationError": {
      return res.status(400).json(err)
    }
    default: {
      return res.status(500).json(err)
    }
  }
}

module.exports = { errorHandler }
