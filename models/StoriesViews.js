import mongoose from "mongoose";

const storyViewsSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stories",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StoryViews", storyViewsSchema);
