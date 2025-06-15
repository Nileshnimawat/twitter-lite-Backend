import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/user.db.js";
import UserRoute from "./routes/user.routes.js";
import TweetRoute from "./routes/tweet.routes.js";
import cookieParser from "cookie-parser";
import messageRoute from "./routes/message.route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://twitter-lite-frontend.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

// Routes
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/tweet", TweetRoute);
app.use("/api/v1/message", messageRoute);

app.get("/", (req, res) => {
  res.send("hello world ");
});

export default app; // <-- Export the app for use in socket.js