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
  getTrendingBlogs
} from "../controllers/blogController.js";

import { isWriterApproved } from "../middleware/auth.js";
import { authorizePermissions } from "../middleware/auth.js";
import auth from "../middleware/auth.js";

router.route("/").post(auth, isWriterApproved, createBlog).get(getAllBlogs);
router.route("/getSingleCategoryBlogs").get(getSingleCategoryBlogs);
router.route("/singleBlog/:blogId").get(getSingleBlog);
router.route("/singleWriterBlogs").get(getSingleWritterBlogs);
router.route("/trendingBlogs").get(getTrendingBlogs);

// // Admin blogs routes
router.route("/adminBlogs").get(auth,authorizePermissions("admin"),dispalyAllBlogs);
router.route("/adminBlogsStatus/:blogId").post(auth,authorizePermissions("admin"),updateBlogStatus);
router.route("/RejectBlogsStatus/:blogId").post(auth,authorizePermissions("admin"),RejectBlogStatus);



export default router;
