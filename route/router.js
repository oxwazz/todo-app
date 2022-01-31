const express = require("express");
const pool = require("../db");
const router = express.Router();
const cors = require("cors");
router.use(express.json()); // --> req.body

var corsOptions = {
  origin: "*",
};
router.use(cors(corsOptions));

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
      getTask.rows == ""
        ? res.json(`Task id:${id} not found`)
        : res.json(getTask.rows);
    } catch (error) {
      res.json("There is an error!");
      console.log(error);
    }
  })

  // TODO 1: bisa update task semua data tidak hanya
  // description (bisa satu / beberapa data sekaligus)
  //
  // example:
  //  1. update data description dan date
  //  2. update data name saja
  //  3. update data priority, name, is_done

  // TODO 2: apabila id task tidak ada maka muncul
  // keterangan "Task not found" / semacamnya

  // Update task = PATCH: localhost/todos/1 <- data diambil dari body
  .patch(async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const { description } = req.body;
      const { date } = req.body;
      const { priority } = req.body;
      const { is_done } = req.body;
      let firstQuery = `${name ? "name=" + "'" + name + "'," : ""}${
        description ? "description=" + "'" + description + "'," : ""
      }${date ? "date=" + "'" + date + "'," : ""}${
        priority ? "priority=" + "'" + priority + "'," : ""
      }${is_done ? "is_done=" + "'" + is_done + "'," : ""}`;
      firstQuery = firstQuery.replace(/(\s*,?\s*)*$/, "");
      let secondQuery = `UPDATE tasks SET ${firstQuery} WHERE id=${id} RETURNING *`;
      const updateTask = await pool.query(secondQuery);
      updateTask.rows == ""
        ? res.json(`Task id:${id} not found`)
        : res.json("Task has been update");
    } catch (error) {
      res.json("Task failed to update");
      console.log(error);
    }
  })

  // TODO 1: apabila id task tidak ada maka muncul
  // keterangan "Task not found" / semacamnya

  // Delete task = DELETE: localhost/todos/1
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const deleteTask = await pool.query(
        `DELETE FROM tasks
         WHERE id=$1`,
        [id]
      );
      deleteTask.rowCount == 1
        ? res.json(`Task id:${id} has been deleted`)
        : res.json(`Task id:${id} not found`);
    } catch (error) {
      res.json("Task failed to delete");
      console.log(error);
    }
  });

// TODO 1: bisa memakai satu atau beberapa parameter
//
// example:
//  1. GET: localhost/todos?offset=10
//  2. GET: localhost/todos?limit=5
//  3. GET: localhost/todos?offset=0&limit=5

//Get all task & offset & limit = GET: localhost/todos?offset=2&limit=3
router.get("/", async (req, res) => {
  try {
    const { offset } = req.query;
    const { limit } = req.query;
    const regQuery = `SELECT * FROM tasks;`;
    const offsetLimitQuery = `SELECT id, name, description, date, priority, is_done FROM tasks 
    ${offset ? "OFFSET" + " " + offset : ""} ${
      limit ? "LIMIT" + " " + limit : ""
    };`;
    const getTask = await pool.query(
      offset !== undefined || limit !== undefined ? offsetLimitQuery : regQuery
    );
    res.json(getTask.rows);
  } catch (error) {
    res.json("There is an error!");
    console.log(error);
  }
});

module.exports = router;
