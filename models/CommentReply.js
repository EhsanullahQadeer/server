import mongoose from "mongoose";

let comentsReplyScheema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: {
      type: String,
      required:true,
    },
    deleted:{
        type:Boolean,
        default:false
    },
    replies:{
    type:Number,
    }
  },
  { timestamps: true }
);
export default mongoose.model("CommentsReply",comentsReplyScheema)
