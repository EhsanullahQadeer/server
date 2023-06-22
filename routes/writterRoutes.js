import express from "express";

let router = express.Router();

import {
  createWritter,
  getAllApprovedWritters,
  getAllWritterRequests,
  ApproveWritter,
  rejectRequests,
  getSingleWritter,
  getCurrentWritter,
  updateWriter,
  DisapproveWritter,
  getAllDisapprovedWritters,
  getAllRejectedRequests,
  uploadWriterProfileImage,
  removeWriterProfileImage,
  topWritters
} from "../controllers/writterController.js";
import { uploadFile,removeImage } from "../middleware/coludinaryImage.js";
import singleUpload from "../middleware/multer.js";
import { authorizePermissions } from "../middleware/auth.js";
import auth from "../middleware/auth.js";

router.route("/").post(auth, createWritter);

router.route("/currentWritter").get(auth, getCurrentWritter);

router.route("/updateWriter/:writerId").post(auth, updateWriter);
router.route("/topWritters").get(topWritters);
// router.route("/:writerId").get(getSingleWritter);

//
// writer image
router.route("/uploadWritterProfileImage/:writerId").post(auth,singleUpload,uploadFile,uploadWriterProfileImage);
router.route("/removeWritterProfileImage/:writerId").post(auth,removeImage,removeWriterProfileImage);



// Below we need to add the middelware for the admins
              //  Display Data
router.route("/approvedWriters").get(auth,authorizePermissions("admin"),getAllApprovedWritters);
router.route("/writersRequests").get(auth,authorizePermissions("admin"),getAllWritterRequests);
router.route("/disapprovedWritters").get(auth,authorizePermissions("admin"),getAllDisapprovedWritters);
router.route("/rejectedRequests").get(auth,authorizePermissions("admin"),getAllRejectedRequests);

              // Actions on Data

router.route("/approveWriter/:writerId").post(auth,authorizePermissions("admin"),ApproveWritter);
router.route("/disapproveWriter/:writerId").post(auth,authorizePermissions("admin"),DisapproveWritter);
router.route("/rejectRequests/:writerId").post(auth,authorizePermissions("admin"),rejectRequests);





export default router;
