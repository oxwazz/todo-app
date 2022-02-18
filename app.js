require("dotenv").config();
const express = require("express");
const todosRoute = require("./routes/todos");
const userRoute = require("./routes/user");
const app = express();
const PORT = process.env.PORT || 8080;
app.use("/user", userRoute);
app.use("/todos", todosRoute);
app.use(express.json()); // --> req.body



app.use("*", (req, res) => {
  //--> Page not found handler 404
  res.status(404).json({
    success: false,
    status: "Page Not Found",
  });
  console.log("Page not found");
});

// App listening port
app.listen(PORT, () => {
  console.log(`Apps listening on: http://localhost:${PORT}`);
});

module.exports=app
