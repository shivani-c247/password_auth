const express = require("express");
const app = express();
const mongoose = require("mongoose");
const router =require("./routes/index")

app.use(express.json())
mongoose
  .connect("mongodb://localhost:27017/Crude", {
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

/*
  var Publishable_Key = 'pk_test_51KdV0ESHWdVpZknsNqNiKkWBDQU01JRKrPqWCh3zcuAbFZNublep0u8q7XJxS8CXxr1g80ZNJrqqqkUcOFWZBj0i000incBhXT'
  var Secret_Key = 'sk_test_51KdV0ESHWdVpZknsGGg0Lj7Jm0rFvXoFVQ2rRZ238TjpuQuFiAV8Mm732KdOY036W2HCWLIp660Q75vXXn8Umjtz00U9Yx6Ekw'
  const stripe = require('stripe')(Secret_Key)  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs'); 
  
  
  app.get('/', function(req, res){
      res.render('home', {
         key: Publishable_Key
      })
  })
  */

  app.listen(process.env.PORT || 8000, () => {
  console.log(" server is running at port 8000");
});
