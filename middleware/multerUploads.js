import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { StatusCodes } from "http-status-codes";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "storyVideo") {
      cb(null, "uploads/stories/videos");
    } else if (file.fieldname === "storyImage") {
      cb(null, "uploads/stories/images");
    } else {
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
    ])(req, res, (error) => {
      if (error) {
        return res.status(500).send("Error uploading files");
      }

      // Process uploaded files
      const { storyImage, storyVideo } = req.files;
      if (storyImage) {
        req.body.videoUrl = `/uploads/stories/images/${storyImage[0].filename}`;
      }

      if (storyVideo) {
        req.body.imageUrl = `/uploads/stories/videos/${storyVideo[0].filename}`;
      }
      next();
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong"})
  }
};
