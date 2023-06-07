import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import { getDataUri } from "../utils/dataUri.js";
import { extractPublicId } from 'cloudinary-build-url';
import { response } from "express";
 
// This is middlware used to uload image to cloudinary server
export const uploadFile = async (req, res,next) => {
    const fileUri =getDataUri(req.file);
  try {
    const result = await cloudinary.uploader.upload(
      fileUri.content,
      {
        use_filename: true,
        folder: "file-upload",
      }
    );
    req.body.imgUrl = result.secure_url;
    next();

  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong !"})
  }

  // const fileUri = getDataUri(req.file);
  // try {
  //   const result = await cloudinary.uploader.upload(fileUri.content, {
  //     resource_type: "auto", // Automatically detect the resource type (image or video)
  //     folder: "file-upload",
  //   });
  //   req.body.imgUrl = result.secure_url;
  //   next();
  // } catch (error) {
  //   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Something Went Wrong!" });
  // }
};
//
// This is middlware used to remove image from cloudinary server
//This is used as middleware and as logic reuse ....
export const removeImage = async (req, res,next) => {
try {
  const {imgUrl}=req.body||req;
const publicId = extractPublicId(
  imgUrl
) 
   const result = await cloudinary.uploader.destroy(publicId);
   if (result.result =='ok'){
    if(req.body){
      next();
    }
   }else{
    res.status(StatusCodes.NOT_FOUND).json({msg:"Photo Not Found !"})
   }
} catch (error) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong !"})
}
};