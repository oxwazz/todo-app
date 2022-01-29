const express = require('express')
const app = express()
const port = 3030
const todosRouter = require('./route/router')
app.use('/todos', todosRouter)
app.use(express.json()) // --> req.body



//App listening port
app.listen(port, () => [
    console.log(`Apps listening on port: ${port}`)
])

