const express = require("express");
const router = express.Router()
const pool = require('../db')
const app = express()
app.use(express.json()) // --> req.body

// Create task = POST: localhost/todos <- data diambil dari body
router.post('/', async (req, res) => {
    try {
        const {name} = req.body
        const {description} = req.body
        const {date} = req.body
        const {priority} = req.body
        const {is_done} = req.body
        const createTask = await pool.query(
            "INSERT INTO tasks (name, description, date, priority, is_done) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, description, date, priority, is_done]
        )
        res.json(createTask)
    } catch (error) {
        res.json('Terjadi kesalahan')
        console.log(error)
    }
})

// Get task = GET: localhost/todos/1
// Update task = PATCH: localhost/todos/1 <- data diambil dari body
// Delete task = DELETE: localhost/todos/1
router
    .route('/:id')
    // Get task = GET: localhost/todos/1
    .get(async (req, res) => {
        try {
            const {id} = req.params
            const getTask = await pool.query(
                "SELECT * FROM tasks WHERE id=$1", [id]
            )
            const isNulldata = () => {
                getTask.rows == "" ? res.json(`Task dengan id=${id} belum tersedia di database`) : res.json(getTask.rows)
            }
            res.json(isNulldata())
        } catch (error) {
            res.json('Terjadi kesalahan')
            console.log(error)
        }
    })
    // Update task = PATCH: localhost/todos/1 <- data diambil dari body
    .patch(async (req, res) => {
        try {
            const {id} = req.params
            const {description}=req.body
            const updateTask = await pool.query (
                "UPDATE tasks SET description=$1 WHERE id=$2", [description, id]
            )
            res.json('Task telah terupdate')
        } catch (error) {
            res.json('Task gagal terupdate')
            console.log(error)
        }
    })
    // Delete task = DELETE: localhost/todos/1
    .delete(async (req, res) => {
        try {
            const {id} = req.params
            const deleteTask = await pool.query (
                "DELETE FROM tasks WHERE id=$1", [id]
            )
            res.json('Task telah dihapus')
        } catch (error) {
            res.json('Task gagal dihapus')
            console.log(error)
        }
    })

//Get all task & offset & limit = GET: localhost/todos?offset=0&limit=5
router.get('/', async (req, res) => {
    try {
        const {offset} = req.query
        const {limit} = req.query
        const regQuery = "SELECT * FROM tasks;"
        const offsetQuery = `SELECT id, name, description, date, priority, is_done FROM tasks OFFSET ${offset} LIMIT ${limit};`
        const isRegular = async () => getAllTask = await pool.query(regQuery)      
        const isOffset = async() => getOffSetLimit = await pool.query(offsetQuery)
        const getTask = () => {
            if (limit === undefined && offset === undefined ) {
                return isRegular()
            } else {
                return isOffset()
            }
        }
        const result = await getTask()
        res.json(result.rows)
    } catch (error) {
        res.json('Terjadi kesalahan')
        console.log(error)
    }
})

module.exports = router