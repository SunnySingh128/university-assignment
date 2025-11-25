const express=require("express");
const app=express();
const dotenv=require("dotenv");
const path=require("path");
dotenv.config();


// cors policy
const cors = require("cors"); 
app.use(cors());


// port number
const port=process.env.PORT;
const connect=require("./connection/index.js");
const authroutes=require("./routes/password");

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// all admin routes
app.use("/auth",require("./routes/admin"));
app.use("/admin",require("./routes/admin"));
app.use("/store",require("./routes/user"));
app.use("/student",require("./routes/student"));
app.use("/auth",authroutes);
app.use('/:filename', express.static(path.join(__dirname, './uploads')));

// database connection
connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected to database");
}).catch((err)=>{ 
    console.log(err); 
});
app.listen(port,(req,res)=>{
    console.log(`http://localhost:${port}`);
})