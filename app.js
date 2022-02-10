require("dotenv").config();
const express = require("express");
const todosRouter = require("./todosRoute/router");
const userRouter = require("./usersRoute/user");
const app = express();
const PORT = process.env.PORT || 3030;
app.use("/user", userRouter);
app.use("/todos", todosRouter);
app.use(express.json()); // --> req.body

app.use('*', (req, res) =>{   //--> Page not found handler 404 
  res.status(404).json({
      success: false,
      status: 'Page Not Found'
  })
  console.log('Page not found')
})

// App listening port
app.listen(PORT, () => {
  console.log(`Apps listening on: http://localhost:${PORT}`);
});
