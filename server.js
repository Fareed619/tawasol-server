const express = require("express");

const connectDB = require("./config/db")
const cors = require("cors");

const app = express();
app.use(express.json())
app.use(cors())

// The port that i working on it
const PORT = process.env.PORT || 5000 ;



app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/profiles", require("./routes/profiles"));



app.use(express.static(__dirname + "/public"))  // To allow client to access on public folder








// api get request 

app.get("/", (req, res)=> {

    res.send("the server is working")
})

connectDB();





// to keep the server able to listen to any request 
app.listen(PORT, ()=>{
    console.log(`Server has started on Port ${PORT}`)
})