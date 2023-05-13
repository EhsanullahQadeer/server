import BlogModel from "../models/Blog.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import WriterModel from "../models/Writter.js";
import { response } from "express";
import mongoose from "mongoose";

// router.get("/orders", async (req, res) => {

// });


// single category blogs
export const getSingleCategoryBlogs= async (req,res)=>{
  let category = req.query.category;
  try {
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 13;
    const skip = (page - 1) * limit;

    const result = await BlogModel.aggregate([

      { $match: { status:"Active", category:category } },
      {
        $lookup: {
          from: "writters",
          localField: "writer",
          foreignField: "_id",
          as: "writter",
        },
      },
      {
        $project: {
          "writter.firstName": 0,
          "writter.lastName": 0,
          "writter.age": 0,
          "writter.agePrivacy": 0,
          "writter.cityPrivacy": 0,
          "writter.emailPrivacy": 0,
          "writter.contactPrivacy": 0,
          "writter.city": 0,
          "writter.province": 0,
          "writter.country": 0,
          "writter.qualification": 0,
          "writter.email": 0,
          "writter.phoneNo": 0,
          "writter.purpose": 0,
          "writter.userId": 0,
          "writter.isApproved": 0,
          "writter.isDisapproved": 0,
          "writter.disapprovedComment": 0,
          "writter.isRejected": 0,
          "writter.createdAt": 0,
          "writter.updatedAt": 0,
          "writter.qualifications": 0,
        }
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
  

    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
  }

  
}
// Getting all blogs

export const getAllBlogs = async (req, res) => {
//   let category = req.query.category;
//   const queryObject = {};
//   if (category && category != "all") {
//     queryObject.category = category;
//   }
// console.log(category)
  // let Blogs = await BlogModel.find(category)
  // .populate({
  //   path: "writer",
  //   // select: "-email -city -contactNumber -age ",
  //   select:"name designation shortBio "
  // });
  // res.status(StatusCodes.OK).json({ Blogs });

  try {
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 13;
    const skip = (page - 1) * limit;

    const result = await BlogModel.aggregate([

      { $match: {status:"Active"} },
      {
        $lookup: {
          from: "writters",
          localField: "writer",
          foreignField: "_id",
          as: "writter",
        },
      },
      {
        $project: {
          "writter.firstName": 0,
          "writter.lastName": 0,
          "writter.age": 0,
          "writter.agePrivacy": 0,
          "writter.cityPrivacy": 0,
          "writter.emailPrivacy": 0,
          "writter.contactPrivacy": 0,
          "writter.city": 0,
          "writter.province": 0,
          "writter.country": 0,
          "writter.qualification": 0,
          "writter.email": 0,
          "writter.phoneNo": 0,
          "writter.purpose": 0,
          "writter.userId": 0,
          "writter.isApproved": 0,
          "writter.isDisapproved": 0,
          "writter.disapprovedComment": 0,
          "writter.isRejected": 0,
          "writter.createdAt": 0,
          "writter.updatedAt": 0,
          "writter.qualifications": 0,
        }
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
  

    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
  }
};

export const getSingleBlog = async (req, res) => {
  try {
  let { blogId } = req.params;
  let Blog = await BlogModel.findOne({ _id: blogId }).populate({
    path: "writer",
    select: "-email -city -contactNumber -age",
  });
  if (!Blog) {
    res.status(StatusCodes.NOT_FOUND).json({msg:"The Blog Not Exists"})
  }else{
    Blog.views = Blog.views +1;
    Blog.save();
    res.status(StatusCodes.OK).json({ Blog });
  }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong !"})
  }
};
//

export const getTrendingBlogs=async (req,res)=>{
  try {
    let  Blogs = await BlogModel.find().populate({
      path: "writer",
      select: "name",
    }).sort({views: -1}).limit(6)
    res.status(StatusCodes.OK).json(Blogs)
  } catch (error) {
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong !"})
  }
}
//getting all writters blogs
export const getSingleWritterBlogs = async (req, res) => {
  // console.log(req.query)
  
  try {

    let { writerId,articlesType} =req.query;
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
      const limit = req.query.pageSize ? +req.query.pageSize : 10;
      const skip = (page - 1) * limit;
      console.log(skip,limit)

  if (articlesType=="all"){
    var WritterBlogs = await BlogModel.find({ userId: writerId}).limit(limit)
    .skip(skip).populate({
      path: "writer",
      select: "name",
    });
  }else{
    var WritterBlogs = await BlogModel.find({ userId: writerId,status:articlesType}).limit(limit)
    .skip(skip).populate({
      path: "writer",
      select: "name",
    });
  }
  
  if(!WritterBlogs){
    res.status(StatusCodes.NOT_FOUND).json({msg:"Blogs Not Found !"});
  }
  res.status(StatusCodes.OK).json(WritterBlogs);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong !"})
  }
};


// Here we need to add some middleware for the writters only so that only the approved writter can write the blog
export const createBlog = async (req, res) => {
  let { title, subTitle, description, category } = req.body;

  if (!title || !subTitle || !description || !category) {
    throw new BadRequestError("Please Provide all the fields");
  }
  let writer = await WriterModel.findOne({ userId: req.body.userId });
  req.body.writer = writer._id.toString();
  await BlogModel.create(req.body);
  res.status(StatusCodes.OK).json({ msg: "The Blog is added Successfully" });
};





//Display All blogs to admin
export const dispalyAllBlogs=async (req,res)=>{
  try {
    // let category = req.query.category;
  // const queryObject = {};

  // if (category && category != "all") {
  //   queryObject.category = category;
  // }

  // let Blogs = await BlogModel.find(category)
  // .populate({
  //   path: "writer",
  //   // select: "-email -city -contactNumber -age ",
  //   select:"name designation shortBio "
  // });
  // res.status(StatusCodes.OK).json({ Blogs });

  try {
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
    const limit = req.query.pageSize ? +req.query.pageSize : 13;
    const skip = (page - 1) * limit;

    const result = await BlogModel.aggregate([
      { $match: { status:"Pending" } },
      {
        $lookup: {
          from: "writters",
          localField: "writer",
          foreignField: "_id",
          as: "writter",
        },
      },
      {
        $project: {
          "writter.firstName": 0,
          "writter.lastName": 0,
          "writter.age": 0,
          "writter.agePrivacy": 0,
          "writter.cityPrivacy": 0,
          "writter.emailPrivacy": 0,
          "writter.contactPrivacy": 0,
          "writter.city": 0,
          "writter.province": 0,
          "writter.country": 0,
          "writter.qualification": 0,
          "writter.email": 0,
          "writter.phoneNo": 0,
          "writter.purpose": 0,
          "writter.userId": 0,
          "writter.isApproved": 0,
          "writter.isDisapproved": 0,
          "writter.disapprovedComment": 0,
          "writter.isRejected": 0,
          "writter.createdAt": 0,
          "writter.updatedAt": 0,
          "writter.qualifications": 0,
        }
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
  

    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
  }
    
  } catch (error) {
    
  }
}



//Here the admin will approve or rejected the blogs
export const updateBlogStatus = async (req, res) => {
  try {
    let { blogId} = req.params;
    let blog = await BlogModel.findOne({ _id: blogId ,status:"Pending"});
    if (!blog) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "Blog Not Found !" });
    }
     else {
      blog.status = "Active";
      await blog.save();
      res
        .status(StatusCodes.OK)
        .json({ msg: "Blog Status Updated Sucessfully !" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
//Here the admin will reject the blogs
export const RejectBlogStatus = async (req, res) => {
  try {
    let { blogId} = req.params;
    let blog = await BlogModel.findOne({ _id: blogId ,status:"Pending"});
    if (!blog) {
      res.status(StatusCodes.NOT_FOUND).json({ msg: "Blog Not Found !" });
    }
     else {
      blog.status = "Rejected";
      await blog.save();
      res
        .status(StatusCodes.OK)
        .json({ msg: "Blog Status Updated Sucessfully !" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something Went Wrong !" });
  }
};
