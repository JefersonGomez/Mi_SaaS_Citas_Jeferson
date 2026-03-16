const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');



const app = express();
app.use(cosr());
app.use(express.json());


const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://jefersonbustamantegomez_db_user:eQXU0xywtAufG4yo@cluster0.wzvkxx5.mongodb.net/mi_saas?retryWrites=true&w=majority", 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB conectada"))
  .catch(err => console.log(err));


app.get('/' , (req,res)=>{
    res.send('Hola Mundo');
});


app.listen(3000,()=>{
    console.log('servidor corriendo en el pueto 3000');
})


