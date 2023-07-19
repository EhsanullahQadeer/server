import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { StatusCodes } from "http-status-codes";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "storyVideo") {
      cb(null, "public/uploads/stories/videos");
    } else if (file.fieldname === "storyImage") {
      cb(null, "public/uploads/stories/images");
    } 
    else if(file.fieldname === "writerPhoto"){
      cb(null, "public/uploads/writer/images");
    }
    else if(file.fieldname === "blogImage"){
      cb(null, "public/uploads/blogs/images");
    }else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});
const upload = multer({ storage });

export const uploadFilesMiddleware = (req, res, next) => {
  try {
    upload.fields([
      { name: "storyVideo", maxCount: 1 },
      { name: "storyImage", maxCount: 1 },
      { name: "writerPhoto", maxCount: 1 },
      { name: "blogImage", maxCount: 1 },
      
    ])(req, res, (error) => {
      if (error) {
        console.log(error)
        return res.status(500).send("Error uploading files");
      }

      // Process uploaded files
      const { storyImage, storyVideo ,writerPhoto,blogImage} = req.files;
      if (storyImage) {
        req.body.imageUrl = storyImage[0].filename;
      }else if(writerPhoto){
        req.body.imageUrl = writerPhoto[0].filename;
      }
      else if(blogImage){
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        // Create the relative path for the uploaded image
        const relativePath = blogImage[0].path.replace(/\\/g, '/').replace('public', '');
        req.body.imageUrl =serverUrl + relativePath ;
      }

      if (storyVideo) {
        req.body.videoUrl = storyVideo[0].filename;
      }
      next();
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong" });
  }
};
