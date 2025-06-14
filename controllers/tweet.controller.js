import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


export const createTweet = async (req, res) => {
  try {
    const userId = req.userId;
    const { description } = req.body;
    const file = req.file;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "tweet should not be empty",
      });
    }

    // Optionally, fetch only needed user fields
    const user = await User.findById(userId).select("name username profileImage");

    const newTweet = new Tweet({
      description,
      userId,
      userDetails: user, // or just userId, and use populate later
    });

    if (file) {
      const uploadRes = await uploadOnCloudinary(file.path);
      if (uploadRes) newTweet.image = uploadRes.secure_url;
    }

    await newTweet.save();
    return res.status(201).json({
      success: true,
      message: "tweet created successfully",
      tweet: newTweet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteTweet = async (req, res) => {
  try {
    const userId = req.userId;
    const tweetId = req.params.id;

    const newTweet = await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json({
      success: true,
      message: "tweet Deleted succesfully",
      newTweet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateTweet = async (req, res) => {};

export const likedOrDisLike = async (req, res) => {
  try {
    const userId = req.userId;
    const tweetId = req.params.id;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    const isLiked = tweet.likes.includes(userId);

    if (isLiked) {
      //like
      await Tweet.updateOne({ _id: tweetId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { liked: tweetId } });
      return res.status(200).json({
        success: true,
        message: "Tweet disliked succesfully",
        flag: false,
      });
    } else {
      //dislike
      await Tweet.updateOne({ _id: tweetId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { liked: tweetId } });
      return res.status(200).json({
        success: true,
        message: "Tweet liked succesfully",
        flag: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const comments = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;
    const tweetId = req.params.id;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Fill the comment section",
      });
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    tweet.comments.push({ text, userId });
    await tweet.save();

    return res.status(200).json({
      success: true,
      message: "Comment successfully added",
      comments: tweet.comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const getAllTweets = async (req, res) => {
  try {
    const userId = req.userId;
    const loggedInUserTweets = await Tweet.find({ userId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followingIds = user.following;
    const followingTweets = await Tweet.find({ userId: { $in: followingIds } });

    const allTweets = [...loggedInUserTweets, ...followingTweets].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    return res.status(200).json({
      success: true,
      message: "All tweets retrieved successfully",
      tweets: allTweets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIndividualTweets = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userTweets = await Tweet.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User's tweets retrieved successfully",
      tweets: userTweets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
