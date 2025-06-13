import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  liked: {
    type: Array,
    default:[]
  },
  followers: {
    type: Array,
    default:[]
  },
  following: {
    type: Array,
    default:[]
  },
  image:{
    type: String
  },
  bio:{
    type: String
  }

},{
    timestamps : true
});

export const User = mongoose.model("User",userSchema);