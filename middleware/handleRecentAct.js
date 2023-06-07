import User from "../models/User.js";
import RecentActivities from "../models/RecentActivities.js";

export const updateViewedBlog = async (req, res, next) => {
    // console.log(req.params)
    const { userId, blogId } = req.params;
  if(userId!=404){
    try {
        const user = await User.findById(userId);
        if (user) {
          // Add the blog to recent activity
         const already=await RecentActivities.findOneAndUpdate(
            { 'viewedPosts.blogId': blogId, 'viewedPosts.userId': userId },
            { $set: { 'viewedPosts.timestamp': new Date() } },
            { new: true }
            
          )
          if(!already){
            const blogViewed = new RecentActivities({
                viewedPosts:{ blogId:blogId ,userId:userId}
              }
              );
              await blogViewed.save();
          }
        
        }
      } catch (error) {
        console.error('Error updating recent activity:', error);
      }
  }
  
    next();
  };