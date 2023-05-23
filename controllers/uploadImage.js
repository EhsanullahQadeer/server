import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import { getDataUri } from "../utils/dataUri.js";
import { extractPublicId } from 'cloudinary-build-url';
 


export const isWriterApproved = async (req, res, next) => {
  try {
    let currentWritter = await WriterModel.findOne({ userId: req.body.userId });
    if (!currentWritter) {
      throw new NotFoundError("The Writer Does Not Exists");
    }
    if (!currentWritter.isApproved) {
      throw new UnAuthenticatedError("You cannot access this route");
    }
    next();
  } catch (error) {
    throw new UnAuthenticatedError(error);
  }
};


 

let uploadImage = async (req, res,next) => {
    const fileUri =getDataUri(req.file);
  try {
    const result = await cloudinary.uploader.upload(
      fileUri.content,
      {
        use_filename: true,
        folder: "file-upload",
      }
    );
  const {secure_url,public_id}=result;
  // console.log(result)
  // console.log(secure_url,public_id)
  // return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
  } catch (error) {
    console.log(error)
    
  }
};

let removeImage = async (req, res) => {
  console.log(req.body)
//   const {imageUrl}=req.body;
// const publicId = extractPublicId(
//   imageUrl
// ) 
//    const result = await cloudinary.uploader.destroy(publicId);
//    console.log (result)
//   const fileUri =getDataUri(req.file);
// try {
//   const result = await cloudinary.uploader.upload(
//     fileUri.content,
//     {
//       use_filename: true,
//       folder: "file-upload",
//     }
//   );
// // console.log( result.secure_url)
// const {secure_url,public_id}=result;
// console.log(result)
// console.log(secure_url,public_id)
// return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
// } catch (error) {
//   console.log(error)
  
// }
};


// const deleteProduct = async(req, res) => {     const productId = req.params.id;      
//   console.log(productId);     let product;   
//     try {         product = await Product.findById(productId);    
//            await cloudinary.uploader.destroy(product.public_id);  
//                   res.send("cloud image deleted")      } 
//                   catch (err) {         res.send({ err });     } 
//                       try {         await product.remove();         res.send("Image deleted")     }
//                        catch (err) {         res.send({ err });     }  }

// export default uploadImage;
// const publicId = extractPublicId(
//   "http://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
// ) 
// console.log(publicId)




