import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const RecentActivitiesSchema=new mongoose.Schema({
    recentViewedPosts:{
        blogId:{
            type: mongoose.Schema.Types.ObjectId,
            // required:[true,"Please Provide Blog Id !"]
        },
        ViewerId:{
            type: mongoose.Schema.Types.ObjectId,
            // required:[true,"Please Provide Viewer Id !"]
        }
    }
})
export default mongoose.Model("RecentActivitiesModel",RecentActivitiesSchema)