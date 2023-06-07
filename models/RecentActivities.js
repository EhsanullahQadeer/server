import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const RecentActivitiesSchema = new mongoose.Schema({
  viewedPosts: {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogs",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    timestamp: {
      type: Date,
    },
  },
  bookmarks: {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogs",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    timestamp: {
        type: Date,
      },
  },
});

RecentActivitiesSchema.pre("save", function (next) {
  if (this.viewedPosts && this.viewedPosts.blogId && this.viewedPosts.userId) {
    this.viewedPosts.timestamp = Date.now();
  }
  if(this.bookmarks && this.bookmarks.blogId && this.bookmarks.userId){
    this.bookmarks.timestamp = Date.now();
  }
  next();
});
export default mongoose.model("RecentActivities", RecentActivitiesSchema);
