import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // 👈 ADD THIS
import connectDB from "./db/user.db.js";
import UserRoute from "./routes/user.routes.js";
import TweetRoute from "./routes/tweet.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// ✅ ADD THIS before any routes
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://twitter-lite-frontend.vercel.app" // deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // for cookies if used
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

// Routes
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/tweet", TweetRoute);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("server is listening at port:", process.env.PORT);
});
