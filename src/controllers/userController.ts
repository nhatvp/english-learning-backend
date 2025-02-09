import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import { successResponse, errorResponse } from "../utils/responseHelper";
import DailyVocabulary, {
  IDailyVocabulary,
} from "../models/dailyVocabulary.model";

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res
        .status(400)
        .json({ status: "error", message: "User ID not found in request." });
    }

    const user: IUser | null = await User.findById(req.userId)
      .select("name username")
      .exec();
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found." });
    }

    // Lấy thông tin tiến độ học tập hàng ngày
    const now = new Date();
    const vnToday = convertToTimezone7(now);
    vnToday.setUTCHours(0, 0, 0, 0); // Thiết lập thời gian đầu ngày theo múi giờ +7

    const dailyVocabulary: IDailyVocabulary | null =
      await DailyVocabulary.findOne({
        userId: req.userId,
        date: {
          $gte: vnToday,
          $lt: new Date(vnToday.getTime() + 24 * 60 * 60 * 1000), // Lấy khoảng thời gian trong ngày
        },
      }).exec();

    const totalWords: number = dailyVocabulary
      ? dailyVocabulary.words.length
      : 0;
    const learnedWords: number = dailyVocabulary
      ? dailyVocabulary.words.filter((w: { learned?: boolean }) => w.learned)
          .length
      : 0;

    const progress = {
      word: `${learnedWords} / ${totalWords}`,
      listen: "0 / 10", // Hard code giá trị tạm thời cho listen
      grammar: "0 / 10", // Hard code giá trị tạm thời cho grammar
    };

    return res.status(200).json({
      data: {
        name: user.name,
        username: user.username,
        progress: progress,
      },
      status: "success",
      message: "User profile fetched successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Server error." });
  }
};

function convertToTimezone7(date: Date): Date {
  const timezoneOffset = date.getTimezoneOffset() * 60000; // Lấy chênh lệch múi giờ của hệ thống
  const timezone7 = 7 * 3600000; // Múi giờ +7 (giờ tính bằng milisecond)
  return new Date(date.getTime() + timezoneOffset + timezone7);
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const users: IUser[] = await User.find({}, "name").exec(); // Lấy tên người dùng

    const now = new Date();
    const vnToday = convertToTimezone7(now);
    vnToday.setUTCHours(0, 0, 0, 0); // Thiết lập thời gian đầu ngày theo múi giờ +7

    const userProgressPromises = users.map(async (user: IUser) => {
      const dailyVocabulary: IDailyVocabulary | null =
        await DailyVocabulary.findOne({
          userId: user._id,
          date: {
            $gte: vnToday,
            $lt: new Date(vnToday.getTime() + 24 * 60 * 60 * 1000), // Lấy khoảng thời gian trong ngày
          },
        }).exec();

      const totalWords: number = dailyVocabulary
        ? dailyVocabulary.words.length
        : 0;
      const learnedWords: number = dailyVocabulary
        ? dailyVocabulary.words.filter((w: { learned?: boolean }) => w.learned)
            .length
        : 0;

      return {
        name: user.name,
        progress: `${learnedWords} / ${totalWords}`,
      };
    });

    const userProgress = await Promise.all(userProgressPromises);

    return res
      .status(200)
      .json({
        data: userProgress,
        status: "success",
        message: "Users retrieved successfully",
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ data: null, status: "error", message: "Server error" });
  }
};
