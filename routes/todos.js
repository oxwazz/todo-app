require("dotenv").config();
const express = require("express");
const pool = require("../db");
const router = express.Router();
router.use(express.json()); // --> req.body
const jwt = require("jsonwebtoken");
const cors = require("cors");

var corsOptions = {
  origin: "*",
};
router.use(cors(corsOptions));

router
  .route("/")
  // Create task = POST: localhost/todos <- data diambil dari body
  .post(async (req, res) => {
    try {
      console.log(3333, "post", req.body);
      const { user_id, name, description, date, priority, is_done } = req.body;
      const createTask = await pool.query(
        `INSERT INTO tasks (user_id, name, description, date, priority, is_done)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [user_id, name, description, date, priority, is_done]
      );
      if (createTask.rowCount == undefined) return res.json('Task failed to add');
      res.json('Task added successfully');

    } catch (error) {
      res.json("There is an error");
      console.log(error);
    }
  }) //--- Middleware authToken berjalan
  // Get data todos?filter=description:halim&sortby=description:desc&limit=2&offset=1
  .get(authToken, async (req, res) => {
    try {
      const { filter, offset, limit, sortby } = req.query;
      let sortbyData = (sortby ? sortby.split(":").shift() : "")
      let sortbyValue = (sortby ? sortby.split(":").pop() : "")
      let filterData = (filter ? filter.split(":").shift() : "")
      let filterValue = (filter ? filter.split(":").pop() : "")
      const baseQuery = `SELECT task_id, tasks.user_id, name, description, date, priority, is_done FROM tasks 
      JOIN users ON users.user_id = tasks.user_id  
      ${filterData == 'is_done' ? "WHERE" + " " + filterData + " " + "IS" + " " + filterValue : ""} 
      ${filterData ? "WHERE" + " " + filterData + " " + "ILIKE" + " " + "'%" + filterValue + "%'" : ""}
      ${"and username=" + "'" + req.user.username + "'" + " " + "and email=" + "'" + req.user.email + "'"} 
      ${sortbyData ? "ORDER BY" + " " + sortbyData + " " + sortbyValue : ""} 
      ${offset ? "OFFSET" + " " + offset : ""} ${limit ? "LIMIT" + " " + limit : ""};`
      const getTask = await pool.query(baseQuery)
      res.json(getTask.rows);
    } catch (error) {
      res.json("There is an error!");
      console.log(error);
    }
  })

router
  //--- Middleware authToken berjalan
  .route("/:id")
  // Get task = GET: localhost/todos/1
  .get(authToken, async (req, res) => {
    try {
      const { id } = req.params;
      const baseQuery = `SELECT task_id, tasks.user_id, name, description, date, priority, is_done FROM tasks
      JOIN users ON users.user_id = tasks.user_id 
      WHERE task_id=${id} and username='${req.user.username}' and email='${req.user.email}'`
      const getTask = await pool.query(baseQuery);
      getTask.rows == "" ? res.json(`Task_id:${id} not found`) : res.json(getTask.rows);
    } catch (error) {
      res.json("There is an error!");
      console.log(error);
    }
  })
  // Update task = PATCH: localhost/todos/1 <- data diambil dari body
  //--- Middleware authToken berjalan
  .patch(authToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, date, priority, is_done } = req.body;
      let firstQuery = `${name ? "name=" + "\'" + name + "\'," : ""}${description ? "description=" + "\'" + description + "\'," : ""}${date ? "date=" + "\'" + date + "\'," : ""}${priority ? "priority=" + "\'" + priority + "\'," : ""}${is_done ? "is_done=" + "\'" + is_done + "\'," : ""}`
      firstQuery = firstQuery.replace(/(\s*,?\s*)*$/, ""); //delete comma
      let secondQuery = `UPDATE tasks SET ${firstQuery} FROM users
      WHERE tasks.user_id = users.user_id AND tasks.task_id=${id} AND users.username = '${req.user.username}' 
      AND users.email = '${req.user.email}';`
      const updateTask = await pool.query(secondQuery)
      updateTask.rowCount == "" ? res.json(`Task_id:${id} not found`) : res.json('Task has been update')
    } catch (error) {
      res.json("Task failed to update");
      console.log(error);
    }
  })
  // Delete task = DELETE: localhost/todos/1
  //--- Middleware authToken berjalan 
  .delete(authToken, async (req, res) => {
    try {
      const { id } = req.params;
      const baseQuery = `DELETE FROM tasks USING users
      WHERE tasks.user_id = users.user_id 
      AND tasks.task_id=${id} 
      AND users.username = '${req.user.username}' 
      AND users.email = '${req.user.email}';`
      const deleteTask = await pool.query(baseQuery);
      deleteTask.rowCount == 1 ? res.json(`Task_id:${id} has been deleted`) : res.json(`Task_id:${id} not found`)
    } catch (error) {
      res.json("Task failed to delete");
      console.log(error);
    }
  });

//Middleware authToken  
function authToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader.split(' ')[1]
  if (token == undefined) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {  //--Decode Access Token
    if (err) res.sendStatus(403)
    req.user = decode
    next()
  })
}

module.exports = router;

