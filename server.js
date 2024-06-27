const express = require("express");

const app = express();
// The port that i working on it
const PORT = process.env.PORT || 5000 ;



// api get request 

app.get("/", (req, res)=> {

    res.send("the server is working")
})






// to keep the server able to listen to any request 
app.listen(PORT, ()=>{
    console.log(`Server has started on Port ${PORT}`)
})