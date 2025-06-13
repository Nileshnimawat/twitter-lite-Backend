import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const tweetSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  userDetails:{
    type: Array,
    default: []
  },
  comments: [commentSchema],
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
}, {
  timestamps: true
});

export const Tweet = mongoose.model("Tweet", tweetSchema);