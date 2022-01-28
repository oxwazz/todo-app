const express = require('express')
const app = express()
const pool = require('./db')
const port = 3030

app.use(express.json()) // --> req.body

// Get all task = GET: localhost/todos
app.get('/todos', async (req, res) => {
    try {
        const getAllTask = await pool.query(
            "SELECT * FROM tasks"
        )
        res.json(getAllTask.rows)
    } catch (error) {
        console.log(error)
    }
})

// Get task = GET: localhost/todos/1
app.get('/todos/:id', async (req, res) => {
    try {
        const {id} = req.params
        const getTask = await pool.query(
            "SELECT * FROM tasks WHERE id=$1", [id]
        )
        console.log(getTask.rows)
        res.json(getTask.rows)
    } catch (error) {
        console.log(error)
    }
})

// Delete task = DELETE: localhost/todos/1
app.delete('/todos/:id', async (req, res) => {
    try {
        const {id} = req.params
        const deleteTask = await pool.query (
            "DELETE FROM tasks WHERE id=$1", [id]
        )
        res.json('Task was deleted')
    } catch (error) {
        console.log(error)
    }
})

// Update task = PATCH: localhost/todos/1 <- data diambil dari body
app.patch('/todos/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {description}=req.body
        const updateTask = await pool.query (
            "UPDATE tasks SET description=$1 WHERE id=$2", [description, id]
        )
        res.json('Task was update')
    } catch (error) {
        console.log(error)
    }
})

// Create task = POST: localhost/todos <- data diambil dari body
app.post('/todos', async (req, res) => {
    try {
        const {id} = req.body
        const {name} = req.body
        const {description} = req.body
        const {date} = req.body
        const {priority} = req.body
        const {is_done} = req.body
        const createTask = await pool.query(
            "INSERT INTO tasks (id, name, description, date, priority, is_done) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [id, name, description, date, priority, is_done]
        )
        res.json(createTask)
    } catch (error) {
        console.log(error)
    }
})

//App listening port
app.listen(port, () => [
    console.log(`Apps listening on port: ${port}`)
])

