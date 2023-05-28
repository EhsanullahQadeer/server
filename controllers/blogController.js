import BlogModel from "../models/Blog.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import WriterModel from "../models/Writter.js";
import { response } from "express";
import mongoose from "mongoose";

export const getSingleCategoryBlogs= async (req,res)=>{
  try {
    let category = req.query.category;
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
//getting top stories
export const getTopStories=async (req,res)=>{

  const page = req.query.pageIndex ? +req.query.pageIndex : 1;
  const limit = req.query.pageSize ? +req.query.pageSize : 4;
  const skip = (page - 1) * limit;

      const previousDate = new Date();
  try {
     //getting minimum date to use in loop logic
    let getDate = await BlogModel.find({
      status:"Active"
    }).sort({ updatedAt: 1 }).limit(1);
    const firstBlogApprovedDate=getDate[0].updatedAt;

    let topStories=[];
      while(topStories.length <=limit && firstBlogApprovedDate<=previousDate ){
      const previousDateString = previousDate.toISOString().slice(0, 10); 
      const prevDay=new Date(previousDateString)
      
      topStories = await BlogModel.aggregate([
          {
            $match: {
                updatedAt: {
            $gte: prevDay
          } ,status:"Active"
            }
          },
          {
            $addFields: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
            }
          },
          {
            $sort: {
              date: -1 ,views: -1 
            }
          },
          {
            $facet: {
              // totalRecords: [{ $count: "total" }],
              data: [{ $skip: skip }, { $limit: limit }],
            },
          },
          {
            $unwind: '$data',
          },
        ])
        //if their is not blogs posted on current date
        previousDate.setDate(previousDate.getDate() - 1);
      }
    res.status(StatusCodes.OK).json(topStories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

//getting all writters blogs
export const getSingleWritterBlogs = async (req, res) => {

  try {
    let { writerId,articlesType} =req.query;
    const page = req.query.pageIndex ? +req.query.pageIndex : 1;
      const limit = req.query.pageSize ? +req.query.pageSize : 10;
      const skip = (page - 1) * limit;
     console.log(writerId)
  if (articlesType=="all"){
    var WritterBlogs = await BlogModel.find({ writer: writerId}).limit(limit)
    .skip(skip).populate({
      path: "writer",
      select: "name",
    });
  }else{
    var WritterBlogs = await BlogModel.find({ writer: writerId,status:articlesType}).limit(limit)
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
//Upload Blog images
export const uploadBlogImgs = async (req, res) => {
  try {
  const {imgUrl}=req.body;
    res.status(StatusCodes.OK).json({imgUrl:imgUrl})
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"Something Went Wrong !"})
  }
};




//Display All blogs to admin
export const dispalyAllBlogs=async (req,res)=>{
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
