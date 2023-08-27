import CommentModel from "../models/Comment.js";
import { StatusCodes } from "http-status-codes";
import BlogModel from "../models/Blog.js";
import { NotFoundError } from "../errors/index.js";
import User from "../models/User.js";
import BlogLikes from "../models/BlogLikes.js";
import Comment from "../models/Comment.js";
import CommentsReply from "../models/CommentReply.js";
import response from "../errors/response.js";
import { checkUser, checkBlog } from "../middleware/Checking.js";
import InternalServerError from "../errors/front/ServerError.js";
import notFound, { badRequest } from "../errors/handling-requests.js";
import CommentReply from "../models/CommentReply.js";
import replyToReply from "../models/blogComments/replyToReply.js";
import mongoose from "mongoose";
// Create a new comment
export async function createComment(req, res) {
  try {
    const { blogId, userId, text } = req.body;

    // Validate required fields
    if (!blogId || !userId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!(await checkUser(userId))) {
      return notFound(res, { msg: "User not Found" });
    }
    if (!checkBlog(blogId)) {
      return notFound(res, { msg: "Blog not Found" });
    }
    const comment = await Comment.create({ blogId, userId, text });

    if (comment) {
      await Comment.populate(comment, [
        { path: "userId", select: "_id firstName lastName photo" },
      ]);
    }
    response(res, comment);
  } catch (error) {
    InternalServerError(res);
  }
}

// Get all comments for a specific blog
export async function getAllComments(req, res) {
  try {
    const { blogId } = req.params;
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 10;
    const skip = (page - 1) * limit;

    const totalCount = await Comment.countDocuments({
      blogId: blogId,
      deleted: false,
    });

    if (!(await checkBlog(blogId))) {
      return notFound(res, { msg: "Blog not Found" });
    }
    const comments = await Comment.aggregate([
      { $match: { blogId: mongoose.Types.ObjectId(blogId), deleted: false } },
      {
        $lookup: {
          from: "commentsreplies", // Name of the replies collection
          localField: "_id",
          foreignField: "commentId",
          as: "replies",
        },
      },
      {
        $lookup: {
          from: "users", // Name of the users collection
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          userId: { $arrayElemAt: ["$user", 0] }, // Extract user array
          replyCount: { $size: "$replies" },
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          likes: 1,
          reportedBy: 1,
          createdAt: 1,
          userId: { _id: 1, firstName: 1, lastName: 1, photo: 1 }, // Include specific fields from user
          replyCount: 1,
        },
      },
      // , likes: -1
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    response(res, { comments, totalCount });
  } catch (error) {
    console.log(error);
    InternalServerError(res);
  }
}
// Update a comment
export async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { text, userId } = req.body;

    // Validate required fields
    if (!text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      userId: userId,
      deleted: false,
    }).populate("userId", "firstName lastName photo");
    if (!comment) {
      return notFound(res, { error: "Comment not found" });
    }
    if (comment.text == text) {
      return badRequest(res, { msg: "No changes to update" });
    }

    comment.text = text;
    await comment.save();
    response(res, comment);
  } catch (error) {
    console.log(error);
    InternalServerError(res);
  }
}

//router.post("/comments/:commentId/replies",
export async function commentReplies(req, res) {
  try {
    const { commentId } = req.params;
    const { userId, text } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    comment.replies.push({ userId, text });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add reply" });
  }
}

// Like a comment /comments/:commentId/like
// function  async (req, res) => {
//   try {
//     const { commentId } = req.params;
//     const { userId } = req.body;
//     const comment = await Comment.findById(commentId);
//     if (!comment) {
//       return res.status(404).json({ error: "Comment not found" });
//     }
//     comment.likes.push(userId);
//     await comment.save();
//     res.status(200).json(comment);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to like comment" });
//   }
// });

//"/comments/:commentId",
export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    await Comment.findOneAndUpdate(
      { _id: commentId, userId: userId },
      { deleted: true }
    );
    response(res, { msg: "Comment deleted successfully" });
  } catch (error) {
    InternalServerError(res);
  }
}

//////////////////////// Coment Reples//////////////////////////////////

//create reply
export async function replyToComment(req, res) {
  try {
    const { commentId } = req.params;
    const { userId, text } = req.body;

    if (!text) {
      return badRequest(res, { msg: "Reply cannot be empty" });
    }

    // Find the comment based on the commentId
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return notFound(res, { msg: "Comment not found." });
    }
    // Create the reply object
    const reply = await CommentReply.create({ commentId, userId, text });
    await reply.populate("userId", "firstName lastName _id photo");
    response(res, reply);
  } catch (error) {
    console.error(error);
    InternalServerError(res);
  }
}
// get replies of a coment
export async function getCommentReplies(req, res) {
  try {
    const { commentId } = req.params;

    // Find the comment based on the commentId
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return notFound(res, { msg: "Comment not found." });
    }

    const replies = await CommentReply.aggregate([
      {
        $match: {
          commentId: mongoose.Types.ObjectId(commentId),
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "users", // Name of the users collection
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: {
          path: "$userId",
        },
      },
      {
        $lookup: {
          from: "replytoreplies", // Name of the replies collection
          localField: "_id",
          foreignField: "replyId",
          as: "replies",
        },
      },
      {
        $addFields: {
          replyCount: { $size: "$replies" },
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          replyCount: 1,
          createdAt: 1,
          userId: { _id: 1, firstName: 1, lastName: 1, photo: 1 },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);
    response(res, replies);
  } catch (error) {
    console.error(error);
    InternalServerError(res);
  }
}
//

//update reply
export async function updateCommentReply(req, res) {
  try {
    const { replyId } = req.params;
    const { text, userId } = req.body;

    // Find the reply based on the replyId
    const reply = await CommentReply.findOneAndUpdate(
      { _id: replyId, userId: userId, deleted: false },
      { text: text },
      { new: true }
    ).populate("userId", "firstName lastName photo");
    if (!reply) {
      return notFound(res, { msg: "Reply not found." });
    }
    response(res, reply);
  } catch (error) {
    console.error(error);
    InternalServerError(res);
  }
}
//delete reply
export async function deleteCommentReply(req, res) {
  try {
    const { replyId } = req.params;
    const { userId } = req.body;

    // Find the reply based on the replyId
    const reply = await CommentReply.findOneAndUpdate(
      { _id: replyId, userId: userId, deleted: false },
      { deleted: true }
    );

    if (!reply) {
      return notFound(res, { msg: "Reply not found." });
    }
    response(res, { msg: "Reply deleted sucessfully." });
  } catch (error) {
    console.error(error);
    InternalServerError(res);
  }
}

/////////////////////// reply to reply////////////////////////////////////////////////////
// Reply to a reply
export async function createReplyToReply(req, res) {
  try {
    const { replyId } = req.params;
    const { userId, text } = req.body;

    // Create the reply object
    const reply = await replyToReply.create({ replyId: replyId, userId, text });
    await reply.populate("userId", "firstName lastName _id photo");

    response(res, reply);
  } catch (error) {
    InternalServerError(res);
  }
}

// Get replies of a commentreply
export async function getReplyToCommentReply(req, res) {
  try {
    const { commentReplyId } = req.params;
    const repliesToReply = await replyToReply.aggregate([
      {
        $match: {
          replyId: mongoose.Types.ObjectId(commentReplyId),
          deleted: false,
        },
      },
      {
        $graphLookup: {
          from: "replytoreplies",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "replyId",
          maxDepth: 1,
          as: "allReplies",
        },
      },
      {
        $addFields: {
          replyCount: { $size: "$allReplies" },
        },
      },
      {
        $lookup: {
          from: "users", // Name of the users collection
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: {
          path: "$userId",
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          replyId: 1,
          replyCount: 1,
          createdAt: 1,
          userId: { _id: 1, firstName: 1, lastName: 1, photo: 1 },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    response(res, repliesToReply);
  } catch (error) {
    InternalServerError(res);
  }
}

// Update a replytoReply
export async function updateReplyToReply(req, res) {
  try {
    const { replyToReplyId } = req.params;
    const { text, userId } = req.body;

    // Find the reply based on the replyId and userId
    const updatedReplytoReply = await replyToReply.findOneAndUpdate(
      { _id: replyToReplyId, userId: userId, deleted: false },
      { text: text },
      { new: true }
    );
    if (!updatedReplytoReply) {
      return notFound(res, { msg: "Reply not found." });
    }
    response(res, updatedReplytoReply);
  } catch (error) {
    console.log(error);
    InternalServerError(res);
  }
}

// Delete a replyToReply
export async function deleteReplyToReply(req, res) {
  try {
    const { replyToReplyId } = req.params;
    const { userId } = req.body;

    // Find the reply based on the replyId and userId
    const reply = await replyToReply.findOneAndUpdate(
      { _id: replyToReplyId, userId: userId, deleted: false },
      { deleted: true }
    );

    if (!reply) {
      return notFound(res, { msg: "Reply not found." });
    }
    response(res, { msg: "Reply deleted successfully." });
  } catch (error) {
    console.error(error);
    InternalServerError(res);
  }
}
