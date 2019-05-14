const errorHandler = (err, req, res, next) => {
  const { name } = err
  switch (name) {
    case "CastError": {
      res.status(400).json(err)
    }

    case "ValidationError": {
      res.status(400).json(err)
    }
    default: {
      res.status(500).json(err)
    }
  }
}

module.exports = { errorHandler }
