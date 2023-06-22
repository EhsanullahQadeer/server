import express from "express";
import Story from "../models/Stories.js";
import StoriesViews from "../models/StoriesViews.js";
import { StatusCodes } from "http-status-codes";
import InternalServerError from "../errors/front/ServerError.js";
import response from "../errors/response.js";
import { checkUser} from "../middleware/Checking.js";

// Create a new story
export const createStory = async (req, res) => {
  try {
    const {
      title,
      description,
      isSponsored,
      btnName,
      btnUrl,
      imageUrl,
      videoUrl,
      scheduleTime,
      isHowSquareAdd,
      lifeTime,
      isDraft,
    } = req.body;
    if (!(title && description) && !imageUrl && !videoUrl) {
      return res.status(400).json({
        msg: "Please fill at least one of the fields: Title & Description, Image, or Video",
      });
    }
    //preventing to storing undefined as a string
    const storyData = {
      ...(title !== "undefined" && { title }),
      ...(description !== "undefined" && { description }),
      ...(btnName !== "undefined" && { btnName }),
      ...(btnUrl !== "undefined" && { btnUrl }),
      ...(imageUrl !== "undefined" && { imageUrl }),
      ...(videoUrl !== "undefined" && { videoUrl }),
      ...(scheduleTime !== "undefined" || (null && { scheduleTime })),
      isSponsored,
      isHowSquareAdd,
      lifeTime,
      isDraft,
    };

    const newStory = new Story(storyData);
    await newStory.save();
    res.status(StatusCodes.OK).json({ msg: "Story created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
//get stories
export const getStories = async (req, res) => {
  let { userId } = req.params;
  const page = req.query.pageIndex ? +req.query.pageIndex : 1;
  const skip = (page - 1) * 10;
  const actionSkip = (page - 1) * 2;
  //
  let currentDate = new Date();

  try {
    const sponsoredStories = await Story.find({
      isSponsored: true,
      isDraft: false,
      expiryTime: { $gt: currentDate },
      $or: [{ scheduleTime: { $lte: currentDate } }, { scheduleTime: null }],
    })
      .sort({ updatedAt: -1 })
      .skip(actionSkip)
      .limit(2)
      .exec();

    //
    const HowSquareAddStories = await Story.find({
      isHowSquareAdd: true,
      isDraft: false,
      expiryTime: { $gt: currentDate },
      $or: [{ scheduleTime: { $lte: currentDate } }, { scheduleTime: null }],
    })
      .sort({ updatedAt: -1 })
      .skip(actionSkip)
      .limit(2)
      .exec();

    //
    const simpleStories = await Story.find({
      isSponsored: false,
      isHowSquareAdd: false,
      isDraft: false,
      expiryTime: { $gt: currentDate },
      $or: [{ scheduleTime: { $lte: currentDate } }, { scheduleTime: null }],
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(10)
      .exec();

    // Sort the viewed stories at end

    // if (userId) {
    //   const viewedStoryIds = await StoriesViews.find({ user: userId }).distinct(
    //     "story"
    //   );

    //   const sortedStories = [
    //     ...sponsoredStories,
    //     ...HowSquareAddStories,
    //     ...simpleStories,
    //   ];
    //   sortedStories.sort((a, b) => {
    //     if (viewedStoryIds.includes(a._id) && !viewedStoryIds.includes(b._id)) {
    //       return 1; // Place viewed story at the end
    //     } else if (
    //       !viewedStoryIds.includes(a._id) &&
    //       viewedStoryIds.includes(b._id)
    //     ) {
    //       return -1; // Place unviewed story at the beginning
    //     } else {
    //       return 0; // Maintain the original order for other stories
    //     }
    //   });
    // }

    response(res, { sponsoredStories, HowSquareAddStories, simpleStories });
  } catch (error) {
    console.log(error);
    InternalServerError(res);
  }
};
//counting views
export const viewStory = async (req, res) => {
  try {
    const { storyId, userId } = req.params;
    //checkUser
    
    // Check if the story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ msg: "Story not found" });
    }
    if(await checkUser(userId)){
      
      const storyView = await StoriesViews.findOne({
        story: storyId,
        user: userId,
      });

      if (storyView) {
        // If the document exists, update the timestamp
        storyView.updatedAt = new Date();
        await storyView.save();
      } else {
        const storyView = new StoriesViews({
          story: storyId,
          user: userId,
          viewed: true,
        });
        const savedStoryView = await storyView.save();
      }
    }
     // Increment the view count in the Stories collection
     await Story.findByIdAndUpdate(storyId, { $inc: { views: 2 } });
    
    return res.status(200).json({ msg: "Story viewed successfully" });
  } catch (error) {
    console.log("Error viewing story:", error);
    console.log9;
    return res.status(500).json({ message: "Internal server error" });
  }
};
