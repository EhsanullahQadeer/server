import CommentModel from "../models/Comment.js";
import { StatusCodes } from "http-status-codes";
import BlogModel from "../models/Blog.js";
import { NotFoundError } from "../errors/index.js";

export const createComment = async (req, res) => {
  let { blogId } = req.params;
  let Blog = await BlogModel.findOne({ _id: blogId });
  if (!Blog) {
    throw new NotFoundError("The Blog Not Exists");
  }
  req.body.blog = blogId;
  req.body.user = req.user.userId;
  await CommentModel.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "The Comment for the Blog is added successfully" });
};

export const singleBlogComments = async (req, res) => {
  let { blogId } = req.params;
  let Blog = await BlogModel.findOne({ _id: blogId });
  if (!Blog) {
    throw new NotFoundError("The Blog Not Exists");
  }

  let Comments = await CommentModel.find({ blog: blogId }).populate({
    path: "user",
    select: "-password",
  });
  res.status(StatusCodes.OK).json({ Comments });
};
