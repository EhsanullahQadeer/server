import express from "express";
let router = express.Router();
import auth from "../middleware/auth.js";
import {
  createComment,
  replyToComment,
  createReplyToReply,

  getAllComments,
  getCommentReplies,
  getReplyToCommentReply,

  updateComment,
  updateCommentReply,
  updateReplyToReply,

  deleteComment,
  deleteCommentReply,
  deleteReplyToReply
  ,
} from "../controllers/commentController.js";
//Create
router.route("/createComment").post(auth,createComment);
router.route("/replyToComment/:commentId").post(auth,replyToComment);
router.route("/createReplyToReply/:replyId").post(auth,createReplyToReply);
//get
router.route("/getAllComments/:blogId").get(getAllComments);
router.route("/getCommentReplies/:commentId").get(getCommentReplies);
router.route("/getReplyToCommentReply/:commentReplyId").get(getReplyToCommentReply);
//update
router.route("/updateComment/:commentId").post(auth,updateComment);
router.route("/updateCommentReply/:replyId").post(auth,updateCommentReply);
router.route("/updateReplyToReply/:replyToReplyId").post(auth,updateReplyToReply);
//delete
router.route("/deleteComment/:commentId").post(auth,deleteComment);
router.route("/deleteCommentReply/:replyId").post(auth,deleteCommentReply);
router.route("/deleteReplyToReply/:replyToReplyId").post(auth,deleteReplyToReply);












export default router;
