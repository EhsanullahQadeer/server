import mongoose from "mongoose";

let replyToReplyScheema = new mongoose.Schema(
  {
    replyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommentsReply",
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
    }
  },
  { timestamps: true }
);
export default mongoose.model("ReplyToReply",replyToReplyScheema)
