
const express = require("express");
const app = express('./app');
const mongoose = require("mongoose");
const router =require("./routes/index")

app.use(express.json())


mongoose
  .connect("mongodb://localhost:27017/password", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection is sucessful");
  })
  .catch((e) => {
    console.log(" no connection");
  });
  
//main route
 app.use("/V1",router)


  app.listen(process.env.PORT || 3000, () => {
  console.log(" server is running at port 3000");
});
