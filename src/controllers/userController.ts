import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import { successResponse, errorResponse } from "../utils/responseHelper";
import DailyVocabulary, {
  IDailyVocabulary,
} from "../models/dailyVocabulary.model";

// Chuyển đổi thời gian sang múi giờ +7 và trả về chuỗi YYYY-MM-DD
function getTodayStr(): string {
  return new Date(new Date().getTime() + 7 * 3600000)
    .toISOString()
    .split("T")[0];
}

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
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const todayStr = getTodayStr();
    const dailyVocabulary: IDailyVocabulary | null = await DailyVocabulary.findOne({
      userId: req.userId,
      date: todayStr,
    }).exec();

    const totalWords: number = dailyVocabulary ? dailyVocabulary.words.length : 0;
    const learnedWords: number = dailyVocabulary
      ? dailyVocabulary.words.filter((w) => w.learned).length
      : 0;

    const progress = {
      word: `${learnedWords} / ${totalWords}`,
      listen: "0 / 10", // Hard code giá trị tạm thời
      grammar: "3 / 10", // Hard code giá trị tạm thời
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

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users: IUser[] = await User.find({}, "name").exec();
    const todayStr = getTodayStr();

    const userProgressPromises = users.map(async (user: IUser) => {
      const dailyVocabulary: IDailyVocabulary | null = await DailyVocabulary.findOne({
        userId: user._id,
        date: todayStr,
      }).exec();

      const totalWords: number = dailyVocabulary ? dailyVocabulary.words.length : 0;
      const learnedWords: number = dailyVocabulary
        ? dailyVocabulary.words.filter((w) => w.learned).length
        : 0;

      return {
        name: user.name,
        progress: `${learnedWords} / ${totalWords}`,
      };
    });

    const userProgress = await Promise.all(userProgressPromises);

    return res.status(200).json({
      data: userProgress,
      status: "success",
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, status: "error", message: "Server error" });
  }
};

export const getDailyVocabulary = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const todayStr = getTodayStr();

    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: todayStr,
    });

    if (!dailyVocabulary) {
      return res.status(404).json({
        data: null,
        status: "error",
        message: "Không tìm thấy từ vựng hôm nay!",
      });
    }

    return res.status(200).json({
      data: dailyVocabulary,
      status: "success",
      message: "Lấy danh sách từ vựng thành công!",
    });
  } catch (error) {
    return res.status(500).json({ data: null, status: "error", message: "Lỗi server!" });
  }
};

export const updateDailyVocabulary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { word } = req.body;
    const todayStr = getTodayStr();

    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: todayStr,
    });

    if (!dailyVocabulary) {
      return res.status(404).json({
        data: null,
        status: "error",
        message: "No vocabulary assigned for today",
      });
    }

    const updatedWords = dailyVocabulary.words.map((w) =>
      w.word === word ? { ...w, learned: true } : w
    );
    const progress = (updatedWords.filter((w) => w.learned).length / 10) * 100;

    dailyVocabulary.words = updatedWords;
    dailyVocabulary.progress = progress;
    await dailyVocabulary.save();

    return res.status(200).json({
      data: dailyVocabulary,
      status: "success",
      message: "Updated vocabulary progress",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, status: "error", message: "Server error" });
  }
};
