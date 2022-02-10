require("dotenv").config()
const express = require("express")
const pool = require("../db")
const user = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
user.use(express.json()) //--> req body

// Register --> user/register  
user.post('/register', async (req, res) => {
  try {
    const { username } = req.body
    const { email } = req.body
    const { password } = req.body
    const hashPassword = await bcrypt.hash(password, 10)  //--> encrypt pass
    const { profile_picture } = req.body
    const register = await pool.query(
      `INSERT INTO users (username, email, password, profile_picture)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, email, hashPassword, profile_picture]
    );
    res.json(register.rows)
  } catch (error) {
    res.json(error)
    console.log(error)
  }
})
// Login --> user/login  
user.post('/login', async (req, res) => {
  const { username } = req.body
  const { password } = req.body
  const usernameQuery = await pool.query (`SELECT * FROM users WHERE username = '${username}';`)
  const fill = usernameQuery.rows
  if (fill == false ) {
    return res.status(400).json(`Username not found`)

  }
  try {
    const getLogin = await pool.query (`SELECT * FROM users WHERE username = '${username}';`)
    const object = getLogin.rows
    const getUser = object.find(({username}) => username)
    const userDetail = {username:getUser.username, email:getUser.email}
    const accessToken = jwt.sign(userDetail, process.env.ACCESS_TOKEN_SECRET) //--Encode Acces Token
    const objetPass = object.find(({password}) => password)
    const getPass = objetPass.password
    if (await bcrypt.compare(password, getPass)) {
      res.json({status:"Sukses Login", "Access Token":accessToken})
    } else {
      res.json('Password not valid')
    }
  } catch (error) {
    res.json(error)
    console.log(error)
  }
})
// DetailUser --> user/detail  
user.get('/detail', async (req, res) => {
  const { username } = req.body
  const { password } = req.body
  const usernameQuery = await pool.query(`select * from users where username='${username}';`)
  const fill = usernameQuery.rows
  if (fill == false ) {
    return res.status(400).json(`Username not found`)
  }
  try {
    const getDetail = await pool.query(`select * from users where username='${username}';`)
    const object = getDetail.rows
    const objectPass = object.find(({password}) => password)
    const getPass = objectPass.password
    if (await bcrypt.compare(password, getPass)) {
      res.json(objectPass)
    } else {
      res.json('Password not valid')
    }
  } catch (error) {
    res.json(error)
    console.log(error)
  }
})
// DeleteUser --> user/delete  
user.delete('/delete', async (req, res) => {
  const { username } = req.body
  const { password } = req.body
  const usernameQuery = await pool.query(`SELECT * FROM users WHERE username='${username}';`)
  const fill = usernameQuery.rows
  if (fill == false ) {
    return res.status(400).json(`Username not found`)
  }
  try {
    const userData = await pool.query(`SELECT * FROM users WHERE username='${username}';`)
    const object = userData.rows
    const objectPass = object.find(({username}) => username)
    const getPass = objectPass
    if (await bcrypt.compare(password, getPass.password)) {
      const userDelete = await pool.query(`DELETE FROM users WHERE username='${username}' RETURNING*;`)
      res.json('User was delete')
    } else {
      res.json('Password not valid')
    }
  } catch (error) {
    res.json(error)
    console.log(error)
  }
})
  
module.exports=user