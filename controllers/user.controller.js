import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Tweet } from "../models/tweet.model.js";
import cloudinary, { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

export const SignUp = async (req, res) => {
  try {
    const { name, username, password, email } = req.body;
    if (!name || !username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already Registered",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server error ",
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Username or Password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Username or Password",
      });
    }

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.SECRET_TOKEN,
      { expiresIn: process.env.SECRET_TOKEN_EXPIRY }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User Successfully Logged In",
      user: existingUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: true,
      message: "Internal Server Error",
    });
  }
};

export const Logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 0,
  });
  return res.status(200).json({
    success: true,
    message: "user successfully logout",
  });
};

export const follow = async (req, res) => {
  try {
    const otherUserId = req.params.id;
    const myid = req.userId;

    const loggedInUser = await User.findById(myid);
    const otherUser = await User.findById(otherUserId);

    if (!loggedInUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already following?
    if (loggedInUser.following.includes(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    // Add to following and followers
    await loggedInUser.updateOne({ $addToSet: { following: otherUserId } });
    await otherUser.updateOne({ $addToSet: { followers: myid } });

    return res.status(200).json({
      success: true,
      message: "Followed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const unfollow = async (req, res) => {
  try {
    const otherUserId = req.params.id;
    const myid = req.userId;

    const loggedInUser = await User.findById(myid);
    const otherUser = await User.findById(otherUserId);

    if (!loggedInUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Not following?
    if (!loggedInUser.following.includes(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove from following and followers
    await loggedInUser.updateOne({ $pull: { following: otherUserId } });
    await otherUser.updateOne({ $pull: { followers: myid } });

    return res.status(200).json({
      success: true,
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } });
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserByID = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, bio } = req.body;
    const files = req.files;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Upload profile image
    if (files.profileImage) {
      const profileRes = await uploadOnCloudinary(files.profileImage[0].path);
      if (profileRes) user.profileImage = profileRes.secure_url;
    }

    // Upload cover image
    if (files.coverImage) {
      const coverRes = await uploadOnCloudinary(files.coverImage[0].path);
      if (coverRes) user.coverImage = coverRes.secure_url;
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;

    await user.save();
    res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    });

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users found",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const getLoggedInUser = async (req, res) => {
  try {
    const id = req.userId;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
