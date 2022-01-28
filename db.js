const {Pool} = require('pg')
const pool = new Pool ({
    user : 'postgres',
    password : 'admin',
    database : 'todoapps',
    host : 'localhost',
    port : 5432
})

module.exports = pool;
    


