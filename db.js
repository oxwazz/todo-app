require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.USER_PG,
  password: process.env.PASS_PG,
  database: process.env.DB_PG,
  host: process.env.HOST_PG,
  port: process.env.PORT_PG,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
