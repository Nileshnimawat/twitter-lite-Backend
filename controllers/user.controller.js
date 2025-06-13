import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Tweet } from "../models/tweet.model.js";

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

export const getFollowers = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    const Followers = user.followers;
    if (!Followers) {
      return res.status(400).json({
        success: false,
        message: "followers are not found",
      });
    }
    const allDetailsOffollowers = await User.find({ _id: { $in: Followers } });
    return res.status(200).json({
      success: true,
      message: "followers retrival from database please wait....",
      Followers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      followers : allDetailsOffollowers
    });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    const Followings = user.following;
    if (!Followings) {
      return res.status(400).json({
        success: false,
        message: "followings are not found",
      });
    }
    const allDetailsOffollowing = await User.find({ _id: { $in: Followings } });
    return res.status(200).json({
      success: true,
      message: "followings retrival from database please wait....",
      Followings : allDetailsOffollowing,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
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

export const getUserByID = async(req, res) =>{
   try {
    const id = req.params.id;
    const user = User.findById(id);
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
}


export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, username, email, password, image, bio } = req.body; // <-- include bio

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for unique username/email if changed
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already taken",
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already taken",
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (image) user.image = image;
    if (bio) user.bio = bio; // <-- update bio

    // If password is provided, hash it
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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
