import express from "express"
import { createTweet, updateTweet, deleteTweet, comments, getAllTweets, likedOrDisLike, getIndividualTweets} from "../controllers/tweet.controller.js";
import {isAuthenticated} from "../middlewares/isAuthenticated.js"
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/createTweet").post(isAuthenticated,upload.single("image") ,createTweet);
router.route("/deleteTweet/:id").delete( isAuthenticated,deleteTweet);
router.route("/LikedorDislike/:id").put(isAuthenticated ,likedOrDisLike);
router.route("/getAllTweets").get( isAuthenticated, getAllTweets);
router.route("/getIndividualTweets/:id").get( isAuthenticated, getIndividualTweets);



export default router
