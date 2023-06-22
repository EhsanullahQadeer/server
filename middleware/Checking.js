import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Writter from "../models/Writter.js";
export async function checkUser(userId,getUser) {
  try {
    let user = await User.findById(userId);
       return user ?(getUser? user: true ): false;
  } catch (error) {
    return false;
  }
}
export async function checkWriter(writerId,getWriter) {
  try {
    let writer = await Writter.findOne({_id:writerId,isApproved:true});
    return writer?(getWriter? writer: true ): false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

export async function checkBlog(blogId) {
    try {
      let blog = await Blog.findById(blogId);
      return blog ? true : false;
    } catch (error) {
      return false;
    }
  }
