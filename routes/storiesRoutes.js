import { Router } from "express";
let router = Router();
import { createStory,getStories,viewStory } from '../controllers/storiesCotroller.js';
import { uploadFilesMiddleware } from "../middleware/multerUploads.js";




router.route('/createStory').post(uploadFilesMiddleware,createStory);
router.route('/getStories/:userId?').get(getStories);
router.route('/viewStory/:userId?/:storyId?').post(viewStory);



export default router;