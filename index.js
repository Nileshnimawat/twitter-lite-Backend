import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/user.db.js";
import UserRoute from "./routes/user.routes.js"
import TweetRoute from "./routes/tweet.routes.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(cookieParser());

connectDB();

//api
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/tweet", TweetRoute);

//http://localhost:8080/api/v1/user/signup

app.get("/", (req,res) => {
    res.send("hello world")
})
app.listen(process.env.PORT || 5000, ()=>{
    console.log("server is listening at port : ",process.env.PORT);
})
