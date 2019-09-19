const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect(process.env.connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})



