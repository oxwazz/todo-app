require("dotenv").config();
const express = require("express");
const todosRouter = require("./route/router");

const app = express();
const PORT = process.env.PORT || 3030;
app.use("/todos", todosRouter);
app.use(express.json()); // --> req.body

// App listening port
app.listen(PORT, () => {
  console.log(`Apps listening on: http://localhost:${PORT}`);
});
