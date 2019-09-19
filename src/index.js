const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
//parses incoming requests in json format
app.use((e, req, res, next) => {
  res.status(500).send()
})

app.listen(port, () => {
  console.log("Server is up on port", port)
})