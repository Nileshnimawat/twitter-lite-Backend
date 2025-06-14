import express from "express"
import { follow,  getLoggedInUser,getAllUsers, getUserByID, Login, Logout, SignUp, unfollow, searchUser, updateProfile } from "../controllers/user.controller.js";
import {isAuthenticated} from "../middlewares/isAuthenticated.js"
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();
//auth
router.route("/signup").post(SignUp);
router.route("/login").post(Login);
router.route("/logout").post(Logout);

router.route("/profile/:id").get(isAuthenticated, getUserByID);
router.route("/myprofile").get(isAuthenticated, getLoggedInUser);


router.route("/follow/:id").post(isAuthenticated ,follow);
router.route("/unfollow/:id").post( isAuthenticated,unfollow);


router.route("/updateProfile").put(isAuthenticated,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile
);


router.route("/getAllUsers").get(isAuthenticated ,getAllUsers);

router.route("/search").get(isAuthenticated, searchUser);


export default router
