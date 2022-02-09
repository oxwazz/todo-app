require("dotenv").config()
const express = require("express");
const pool = require("../db");
const router = express.Router();
router.use(express.json()); // --> req.body
const jwt = require("jsonwebtoken")

//Middleware
//router.use(logger)

router
  .route("/")
  // Create task = POST: localhost/todos <- data diambil dari body
  .post(async (req, res) => {
    try {
      console.log(3333, "post", req.body);
      const { user_id } = req.body;
      const { name } = req.body;
      const { description } = req.body;
      const { date } = req.body;
      const { priority } = req.body;
      const { is_done } = req.body;
      //const baseQuery = `INSERT INTO tasks (${user_id?"user_id":""}, ${name?"name":""}, ${description?"description":""}, ${date?"date":""}, ${priority?"priority":""}, ${is_done?"is_done":""}) VALUES (${user_id?user_id:""}, ${name?name:""}, ${description?description:""}, ${date?date:""}, ${priority?priority:""}, ${is_done?is_done:""}) RETURNING*;`
      //console.log(baseQuery)
      const createTask = await pool.query(
        `INSERT INTO tasks (user_id, name, description, date, priority, is_done)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [user_id, name, description, date, priority, is_done]
      );
      res.json(createTask);
    } catch (error) {
      res.json("There is an error");
      console.log(error);
    }
  }) //--- Middleware authToken berjalan
  // Get data todos?filter=description:halim&sortby=description:desc&limit=2&offset=1
  .get(authToken, async (req, res) => {
    try {  
      const { filter } = req.query;
      const { offset } = req.query;
      const { limit } = req.query;
      const { sortby } = req.query;
      let sortbyData = (sortby?sortby.split(":").shift():"") 
      let sortbyValue = (sortby?sortby.split(":").pop():"") 
      let filterData = (filter?filter.split(":").shift():"") 
      let filterValue = (filter?filter.split(":").pop():"")
      // const baseQuery = `SELECT * FROM tasks 
      // ${filterData == 'is_done' ? "WHERE" + " " + filterData +  " " +"IS"+ " " + filterValue : ""} 
      // ${filterData ? "WHERE" + " "+ filterData +  " " +"ILIKE"+ " " + "'%" + filterValue + "%'" :""} 
      // ${sortbyData ? "ORDER BY" + " " + sortbyData + " " + sortbyValue : ""} 
      // ${offset ? "OFFSET" + " " + offset : ""} ${limit ? "LIMIT" + " " + limit : ""};`

      const baseQuery = `SELECT task_id, tasks.user_id, name, description, date, priority, is_done FROM tasks 
      JOIN users ON users.user_id = tasks.user_id  
      ${filterData == 'is_done' ? "WHERE" + " " + filterData +  " " +"IS"+ " " + filterValue : ""} 
      ${filterData ? "WHERE" + " "+ filterData +  " " +"ILIKE"+ " " + "'%" + filterValue + "%'" :""}
      ${"and username=" + "'" +req.user.username + "'" +  " " +"and email=" + "'" + req.user.email + "'"} 
      ${sortbyData ? "ORDER BY" + " " + sortbyData + " " + sortbyValue : ""} 
      ${offset ? "OFFSET" + " " + offset : ""} ${limit ? "LIMIT" + " " + limit : ""};
     `
      //console.log(111, baseQuery)
      //console.log(33, req.user)
      console.log(555, baseQuery)
      const getTask = await pool.query(baseQuery)
      //console.log(11, getTask)
      res.json(getTask.rows);
    } catch (error) {
      res.json("There is an error!");
      console.log(error);
    }
  })

//Middleware authToken  
function authToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader.split(' ')[1]
  if (token == undefined) return res.sendStatus(401) 
  console.log(345, token)
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) res.sendStatus(403)
    req.user=decode
    //console.log(222, decode)
    next()
  })
}
  
router
  .route("/:id")
  // Get task = GET: localhost/todos/1
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const getTask = await pool.query(
        `SELECT * 
         FROM tasks WHERE task_id=$1`,
        [id]
      );
      getTask.rows == "" ? res.json(`Task_id:${id} not found`) : res.json(getTask.rows);
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
      let secondQuery = `UPDATE tasks SET ${firstQuery} WHERE task_id=${id} RETURNING *`
      const updateTask = await pool.query(secondQuery)
      updateTask.rows == "" ? res.json(`Task_id:${id} not found`) : res.json('Task has been update')
    } catch (error) {
      res.json("Task failed to update");
      console.log(error);
    }
  })
  // Delete task = DELETE: localhost/todos/1
  .delete(async (req, res) => {
    try {
      const deleteTask = await pool.query(
        `DELETE FROM tasks
         WHERE task_id=$1`,
        [id]
      );
      deleteTask.rowCount == 1 ? res.json(`Task_id:${id} has been deleted`) : res.json(`Task_id:${id} not found`)
    } catch (error) {
      res.json("Task failed to delete");
      console.log(error);
    }
  });

async function logger (req, res, next) {
  try {
    const { username } = req.body
    const getUsername = await pool.query (`SELECT * FROM users WHERE username ='${username}'`)
    const nama = getUsername.rows
    const tes = nama.map(({ username }) => username)
    console.log(111, tes)
  
    console.log(333, username)
    if (username==tes) {
      console.log('Anda berhasil login')
      next()
    } else {
      console.log(`Username:${username} isn't registered yet`)
      res.send("error")
    }
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

module.exports = router;
