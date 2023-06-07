import express from "express";
let router = express.Router();
import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  getSingleWritterBlogs,
  dispalyAllBlogs,
  updateBlogStatus,
  RejectBlogStatus,
  getSingleCategoryBlogs,
  getTrendingBlogs,
  uploadBlogImgs,
  getTopStories
} from "../controllers/blogController.js";
import { updateViewedBlog } from "../middleware/handleRecentAct.js";

import { isWriterApproved } from "../middleware/auth.js";
import { authorizePermissions } from "../middleware/auth.js";
import auth from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";
import { uploadFile } from "../middleware/coludinaryImage.js";

router.route("/").post(auth, isWriterApproved, createBlog).get(getAllBlogs);
router.route("/getSingleCategoryBlogs").get(getSingleCategoryBlogs);
router.route("/singleBlog/:blogId/:userId").get(updateViewedBlog,getSingleBlog);
router.route("/singleWriterBlogs").get(getSingleWritterBlogs);
router.route("/trendingBlogs").get(getTrendingBlogs);
router.route("/topStories").get(getTopStories);
//Upload blog Images
// router.route("/uploadBlogImgs").post(uploadBlogImgs);
//auth,singleUpload,
router.route("/uploadBlogImgs").post(auth,singleUpload,uploadFile,uploadBlogImgs);

// // Admin blogs routes
router.route("/adminBlogs").get(auth,authorizePermissions("admin"),dispalyAllBlogs);
router.route("/adminBlogsStatus/:blogId").post(auth,authorizePermissions("admin"),updateBlogStatus);
router.route("/RejectBlogsStatus/:blogId").post(auth,authorizePermissions("admin"),RejectBlogStatus);



export default router;
