require("dotenv").config();
const express = require("express");
const pool = require("../db");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
router.use(express.json()); //--> req body
const cors = require("cors");

var corsOptions = {
  origin: "*",
};
router.use(cors(corsOptions));

// Register --> user/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, profile_picture } = req.body;
    const mail = email.toLowerCase();
    const hashPassword = await bcrypt.hash(password, 10); //--> encrypt pass
    const register = await pool.query(
      `INSERT INTO users (username, email, password, profile_picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) 
       DO NOTHING;`,
      [username, mail, hashPassword, profile_picture]
    );
    if (register.rowCount == 0)
      return res
        .status(409)
        .json({ error: true, message: "Email already registered" });
    res
      .status(200)
      .json({ error: false, message: "Account successfully registered" });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});
// Login --> user/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usernameQuery = await pool.query(
    `SELECT * FROM users WHERE username = '${username}';`
  );
  const fill = usernameQuery.rows;
  if (fill == false) {
    return res.status(401).json({ error: true, message: `Username not found` });
  }
  try {
    const getLogin = await pool.query(
      `SELECT * FROM users WHERE username = '${username}';`
    );
    const object = getLogin.rows;
    const getUser = object.find(({ username }) => username);
    const userDetail = {
      username: getUser.username,
      email: getUser.email,
      id: getUser.user_id,
    };
    const accessToken = jwt.sign(userDetail, process.env.ACCESS_TOKEN_SECRET); //--Encode Acces Token
    const objetPass = object.find(({ password }) => password);
    const getPass = objetPass.password;
    if (await bcrypt.compare(password, getPass)) {
      res.json({
        error: false,
        message: "Sukses Login",
        data: {
          username: getUser.username,
          email: getUser.email,
          id: getUser.user_id,
          access_token: accessToken,
        },
      });
    } else {
      res.status(401).json({ error: true, message: `Password not valid` });
    }
  } catch (error) {
    res.status(401).json({ error: true, message: error });
  }
});
// DetailUser --> user/detail
router.get("/detail", async (req, res) => {
  const { username, password } = req.body;
  const usernameQuery = await pool.query(
    `select * from users where username='${username}';`
  );
  const fill = usernameQuery.rows;
  if (fill == false) {
    return res.status(401).json({ error: true, message: `Username not found` });
  }
  try {
    const getDetail = await pool.query(
      `select * from users where username='${username}';`
    );
    const object = getDetail.rows;
    const objectPass = object.find(({ password }) => password);
    const getPass = objectPass.password;
    if (await bcrypt.compare(password, getPass)) {
      res.json({ error: false, message: "", data: objectPass });
    } else {
      res.status(401).json({ error: true, message: `Password not valid` });
    }
  } catch (error) {
    res.status(401).json({ error: true, message: error });
  }
});
// DeleteUser --> user/delete
router.delete("/delete", async (req, res) => {
  const { username, password } = req.body;
  const usernameQuery = await pool.query(
    `SELECT * FROM users WHERE username='${username}';`
  );
  const fill = usernameQuery.rows;
  if (fill == false) {
    return res.status(401).json({ error: true, message: `Username not found` });
  }
  try {
    const userData = await pool.query(
      `SELECT * FROM users WHERE username='${username}';`
    );
    const object = userData.rows;
    const objectPass = object.find(({ username }) => username);
    const getPass = objectPass;
    if (await bcrypt.compare(password, getPass.password)) {
      await pool.query(
        `DELETE FROM users WHERE username='${username}' RETURNING*;`
      );
      res.json({ error: false, message: "User was delete" });
    } else {
      res.status(401).json({ error: true, message: `Password not valid` });
    }
  } catch (error) {
    res.status(401).json({ error: true, message: error });
  }
});

module.exports = router;
