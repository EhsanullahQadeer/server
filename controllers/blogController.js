import BlogModel from "../models/Blog.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import WriterModel from "../models/Writter.js";
import response from "../errors/response.js";
import notFound from "../errors/handling-requests.js";
import InternalServerError from "../errors/front/ServerError.js";
import BlogLikes from "../models/BlogLikes.js";
import RecentActivities from "../models/RecentActivities.js";

export const getSingleCategoryBlogs = async (req, res) => {

  try {
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 13;
    const skip = (page - 1) * limit;
    let category = req.query.category;
    const storyType = req.query.storyType;

    let sort = { createdAt: -1 };
    let match = {
      status: "Active",
      category: category,
    };
    //all top stories
    if(category=='Top Stories'){
    delete match.category;
    }
    if (storyType=='topStories' || category=='Top Stories') {
      //get top stories for 10days
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      match.createdAt = { $gte: tenDaysAgo };
      sort = { views: -1 };
    }
    const result = await BlogModel.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "writters",
          localField: "writer",
          foreignField: "_id",
          as: "writter",
        },
      },
      {
        $sort: sort,
      },

      {
        $facet: {
          totalRecords: [{ $count: "total" }],
          blogs: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
  }
};
// Getting all blogs

export const getAllBlogs = async (req, res) => {
  try {
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 13;
    const skip = (page - 1) * limit;

    const result = await BlogModel.aggregate([
      { $match: { status: "Active" } },
      {
        $lookup: {
          from: "writters",
          localField: "writer",
          foreignField: "_id",
          as: "writter",
        },
      },
      {
        $project: {
          "writter.firstName": 0,
          "writter.lastName": 0,
          "writter.age": 0,
          "writter.agePrivacy": 0,
          "writter.cityPrivacy": 0,
          "writter.emailPrivacy": 0,
          "writter.contactPrivacy": 0,
          "writter.city": 0,
          "writter.province": 0,
          "writter.country": 0,
          "writter.qualification": 0,
          "writter.email": 0,
          "writter.phoneNo": 0,
          "writter.purpose": 0,
          "writter.userId": 0,
          "writter.isApproved": 0,
          "writter.isDisapproved": 0,
          "writter.disapprovedComment": 0,
          "writter.isRejected": 0,
          "writter.createdAt": 0,
          "writter.updatedAt": 0,
          "writter.qualifications": 0,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
      res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    let { blogId, userId } = req.params;
    let Blog = await BlogModel.findOneAndUpdate(
      { _id: blogId },
      { $inc: { views: 2 } }
    )
      .populate({
        path: "writer",
        select: "-email -city -contactNumber -age",
      })
      .lean();
    if (!Blog) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "The Blog Not Exists" });
    }

    if (userId != "undefined") {
      //This for checking like status of current user
      let like = await BlogLikes.findOne({ blogId, userId });
      if (like) {
        Blog.liked = true;
      }
      //
      const isBookmarked = await RecentActivities.findOne({
        "bookmarks.blogId": blogId,
        "bookmarks.userId": userId,
      });
      if (isBookmarked) {
        Blog.bookmarked = true;
      }
    }
    res.status(StatusCodes.OK).json({ Blog });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
//togle blog Like
export const LikeSingleBlog = async (req, res) => {
  try {
    let { blogId } = req.params;
    let { userId } = req.body;
    if (!blogId || !userId) {
      return res.status(StatusCodes.BAD_REQUEST);
    }

    let blog = await BlogModel.findById(blogId);
    if (!blog) {
      return notFound(res, { msg: "The Blog Not Exists" });
    }

    let like = await BlogLikes.findOne({ blogId, userId });
    if (like) {
      // If like already exists, remove it
      await BlogLikes.findByIdAndDelete(like._id);
      await BlogModel.findByIdAndUpdate(blogId, { $inc: { likes: -1 } });
      return response(res, { msg: "removed" });
    } else {
      // If like doesn't exist, add it
      const newLike = new BlogLikes({
        blogId: blogId,
        userId: userId,
      });
      await newLike.save();
      await BlogModel.findByIdAndUpdate(blogId, { $inc: { likes: 1 } });
      return response(res, { msg: "liked" });
    }
  } catch (error) {
    InternalServerError(res);
  }
};
//
export const getTrendingBlogs = async (req, res) => {
  try {
    let Blogs = await BlogModel.find({ status: "Active" })
      .populate({
        path: "writer",
        select: "name photo",
      })
      .sort({ views: -1 })
      .limit(6);
    res.status(StatusCodes.OK).json(Blogs);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};

//getting all writters blogs
export const getSingleWritterBlogs = async (req, res) => {
  try {
    let { writerId, articlesType } = req.query;
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 10;
    const skip = (page - 1) * limit;
    console.log(writerId);
    if (articlesType == "all") {
      var WritterBlogs = await BlogModel.find({ writer: writerId })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "writer",
          select: "name photo",
        });
    } else {
      var WritterBlogs = await BlogModel.find({
        writer: writerId,
        status: articlesType,
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "writer",
          select: "name photo",
        });
    }

    if (!WritterBlogs) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "Blogs Not Found !" });
    }
    res.status(StatusCodes.OK).json(WritterBlogs);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};

// Here we need to add some middleware for the writters only so that only the approved writter can write the blog
export const createBlog = async (req, res) => {
  let { title, subTitle, description, category } = req.body;

  if (!title || !subTitle || !description || !category) {
    throw new BadRequestError("Please Provide all the fields");
  }
  let writer = await WriterModel.findOne({ userId: req.body.userId });
  req.body.writer = writer._id.toString();
  await BlogModel.create(req.body);
  res.status(StatusCodes.OK).json({ msg: "The Blog is added Successfully" });
};
//Upload Blog images
export const uploadBlogImgs = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    res.status(StatusCodes.OK).json({ imgUrl: imageUrl });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};

//Display All blogs to admin
export const dispalyAllBlogs = async (req, res) => {
  try {
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 13;
    const skip = (page - 1) * limit;

    const result = await BlogModel.aggregate([
      { $match: { status: "Pending" } },
      {
        $lookup: {
          from: "writters",
          localField: "writer",
          foreignField: "_id",
          as: "writter",
        },
      },
      {
        $project: {
          "writter.firstName": 0,
          "writter.lastName": 0,
          "writter.age": 0,
          "writter.agePrivacy": 0,
          "writter.cityPrivacy": 0,
          "writter.emailPrivacy": 0,
          "writter.contactPrivacy": 0,
          "writter.city": 0,
          "writter.province": 0,
          "writter.country": 0,
          "writter.qualification": 0,
          "writter.email": 0,
          "writter.phoneNo": 0,
          "writter.purpose": 0,
          "writter.userId": 0,
          "writter.isApproved": 0,
          "writter.isDisapproved": 0,
          "writter.disapprovedComment": 0,
          "writter.isRejected": 0,
          "writter.createdAt": 0,
          "writter.updatedAt": 0,
          "writter.qualifications": 0,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
  }
};

//Here the admin will approve or rejected the blogs
export const updateBlogStatus = async (req, res) => {
  try {
    let { blogId } = req.params;
    let blog = await BlogModel.findOne({ _id: blogId, status: "Pending" });
    if (!blog) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "Blog Not Found !" });
    } else {
      blog.status = "Active";
      await blog.save();
      res
        .status(StatusCodes.OK)
        .json({ msg: "Blog Status Updated Sucessfully !" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
//Here the admin will reject the blogs
export const RejectBlogStatus = async (req, res) => {
  try {
    let { blogId } = req.params;
    let blog = await BlogModel.findOne({ _id: blogId, status: "Pending" });
    if (!blog) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "Blog Not Found !" });
    } else {
      blog.status = "Rejected";
      await blog.save();
      res
        .status(StatusCodes.OK)
        .json({ msg: "Blog Status Updated Sucessfully !" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
