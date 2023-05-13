import mongoose from "mongoose";

let CommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Please Provide the comment"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "BlogAppUsers",
      required: [true, "Please Provide the user"],
    },
    blog: {
      type: mongoose.Types.ObjectId,
      ref: "BlogAppBlog",
      required: [true, "Please Provide the comment blog"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("BlogAppComments", CommentSchema);
