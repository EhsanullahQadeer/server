import express from "express";
let router = express.Router();

import {
  createComment,
  singleBlogComments,
} from "../controllers/commentController.js";
import auth from "../middleware/auth.js";

router.route("/createComment/:blogId").post(auth, createComment);
router.route("/:blogId").get(singleBlogComments);

export default router;
