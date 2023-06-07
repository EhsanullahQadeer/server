import { Router } from "express";
let router = Router();
import { createStory } from '../controllers/storiesCotroller.js';
import { uploadFilesMiddleware } from "../middleware/multerUploads.js";




router.route('/createStory').post(uploadFilesMiddleware,createStory);

export default router;