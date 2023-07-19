import RecentActivities from "../models/RecentActivities.js";
import Blog from "../models/Blog.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

export const getRecentlyViewedBlogs = async (req, res) => {
  const { userId } = req.params;
  const page = req.query.pageIndex ? +req.query.pageIndex : 1;
  const limit = req.query.pageSize ? +req.query.pageSize : 10;
  const skip = (page - 1) * limit;
  try {
    let data = await RecentActivities.find({ "viewedPosts.userId": userId })
      .select("-_id")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "viewedPosts.blogId",
      })
      .sort({ "viewedPosts.timestamp": -1 });
    const recentViewedBlogs = await Blog.populate(data, {
      path: "viewedPosts.blogId.writer",
      select: "name photo",
    })
   
    const recentViewedBlogsData = recentViewedBlogs.map(item =>item.viewedPosts);
         
    res.status(StatusCodes.OK).json(recentViewedBlogsData);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
//add bookmarks
export const addBookmark = async (req, res) => {
  try {
    const {blogId } = req.params;
    const {userId}=req.body;

    if (userId == 404) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "User Id Not Found !" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "User Do Not Exists !" });
    }
    const already = await RecentActivities.findOneAndUpdate(
      {
        "bookmarks.blogId": blogId,
        "bookmarks.userId": userId,
      },
      { $set: { "bookmarks.timestamp": new Date() } },
      { new: true }
    );
    if (!already) {
      let bookmark = await RecentActivities.create({
        bookmarks: { blogId: blogId, userId: userId },
      });
    }
    res.status(StatusCodes.OK).json({isBookmarked:true});
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
//remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    const {blogId } = req.params;
    const {userId}=req.body;
    await RecentActivities.deleteMany({
      "bookmarks.blogId": blogId,
      "bookmarks.userId": userId,
    });
    res.status(StatusCodes.OK).json({ msg: "Bookmark Removed Successfully !" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
//get bookmarks
export const getBookmark = async (req, res) => {
  const page = req.query.pageIndex ? +req.query.pageIndex : 1;
  const limit = req.query.pageSize ? +req.query.pageSize : 10;
  const skip = (page - 1) * limit;
  try {
    const { userId } = req.params;
    let data = await RecentActivities.find({ "bookmarks.userId": userId })
      .select("-_id")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "bookmarks.blogId",
      })
      .sort({ "bookmarks.timestamp": -1 });

    const bookmarks = await Blog.populate(data, {
      path: "bookmarks.blogId.writer",
      select: "name photo",
    })
    
    const bookmarksData = bookmarks.map(item => item.bookmarks);
    res.status(StatusCodes.OK).json(bookmarksData);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};

