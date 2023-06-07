import mongoose from "mongoose";

const storiesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 250,
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    btnName: {
      type: String,
      maxlength: 20,
    },
    btnUrl: {
      type: String,
      maxlength: 255,
    },
    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Stories", storiesSchema);

