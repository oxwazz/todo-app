const express = require("express");
const pool = require("../db");
const router = express.Router();
router.use(express.json()); // --> req.body

// Create task = POST: localhost/todos <- data diambil dari body
router.post("/", async (req, res) => {
  try {
    console.log(3333, "post", req.body);
    const { name } = req.body;
    const { description } = req.body;
    const { date } = req.body;
    const { priority } = req.body;
    const { is_done } = req.body;
    const createTask = await pool.query(
      `INSERT INTO tasks (name, description, date, priority, is_done)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, date, priority, is_done]
    );
    res.json(createTask);
  } catch (error) {
    res.json("There is an error");
    console.log(error);
  }
});
// Get task = GET: localhost/todos/1
// Update task = PATCH: localhost/todos/1 <- data diambil dari body
// Delete task = DELETE: localhost/todos/1
router
  .route("/:id")
  // Get task = GET: localhost/todos/1
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const getTask = await pool.query(
        `SELECT * 
         FROM tasks WHERE id=$1`,
        [id]
      );
      getTask.rows == "" ? res.json(`Task id:${id} not found`) : res.json(getTask.rows);
    } catch (error) {
      res.json("There is an error!");
      console.log(error);
    }
  })
  // Update task = PATCH: localhost/todos/1 <- data diambil dari body
  .patch(async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const { description } = req.body;
      const { date } = req.body;
      const { priority } = req.body;
      const { is_done } = req.body;
      let firstQuery = `${name?"name="+"\'" + name + "\',":""}${description?"description="+"\'" + description + "\',":""}${date?"date="+"\'" + date + "\',":""}${priority?"priority="+"\'" + priority + "\',":""}${is_done?"is_done="+"\'" + is_done + "\',":""}`
      firstQuery = firstQuery.replace(/(\s*,?\s*)*$/, "");
      let secondQuery = `UPDATE tasks SET ${firstQuery} WHERE id=${id} RETURNING *`
      const updateTask = await pool.query(secondQuery)
      updateTask.rows == "" ? res.json(`Task id:${id} not found`) : res.json('Task has been update')
    } catch (error) {
      res.json("Task failed to update");
      console.log(error);
    }
  })
  // Delete task = DELETE: localhost/todos/1
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const deleteTask = await pool.query(
        `DELETE FROM tasks
         WHERE id=$1`,
        [id]
      );
      deleteTask.rowCount == 1 ? res.json(`Task id:${id} has been deleted`) : res.json(`Task id:${id} not found`)
    } catch (error) {
      res.json("Task failed to delete");
      console.log(error);
    }
  });
 
router.get("/", async (req, res) => {
  try {  
    const { filter } = req.query;
    const { offset } = req.query;
    const { limit } = req.query;
    let filterData = (filter?filter.split(":").shift():"") 
    let filterValue = (filter?filter.split(":").pop():"")
    const baseQuery = `SELECT * FROM tasks ${filterData == 'is_done' ? "WHERE" + " " + filterData +  " " +"IS"+ " " + filterValue : "WHERE" + " "+ filterData +  " " +"ILIKE"+ " " + "'%" + filterValue + "%'"} ${offset ? "OFFSET" + " " + offset : ""} ${limit ? "LIMIT" + " " + limit : ""};`
    const getTask = await pool.query(baseQuery)
    res.json(getTask.rows);
  } catch (error) {
    res.json("There is an error!");
    console.log(error);
  }
});

module.exports = router;
