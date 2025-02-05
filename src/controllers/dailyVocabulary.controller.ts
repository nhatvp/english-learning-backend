import { Request, Response } from "express";
import DailyVocabulary from "../models/dailyVocabulary.model";
import { AuthRequest } from "../types/custom";

export const getDailyVocabulary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    const now = new Date();
    const utcTimestamp = now.getTime() + now.getTimezoneOffset() * 6000;
    const vnToday = new Date(utcTimestamp + 7 * 3600 * 1000);
    vnToday.setUTCHours(0, 0, 0, 0); // Sử dụng giờ UTC để tránh vấn đề múi giờ

    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: {
        $gte: vnToday,
        $lt: new Date(vnToday.getTime() + 24 * 60 * 60 * 1000), // Lấy khoảng thời gian trong ngày
      },
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
    return res
      .status(500)
      .json({ data: null, status: "error", message: "Lỗi server!" });
  }
};

export const updateDailyVocabulary = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { word } = req.body;

    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: new Date().toISOString().split("T")[0],
    });

    if (!dailyVocabulary) {
      return res.status(404).json({
        data: null,
        status: "error",
        message: "No vocabulary assigned for today",
      });
    }

    const updatedWords = dailyVocabulary.words.map((w) =>
      w.word === word
        ? { ...w, learned: true }
        : {
            ...w,
            learned: w.hasOwnProperty("learned") ? (w as any).learned : false,
          }
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
    return res
      .status(500)
      .json({ data: null, status: "error", message: "Server error" });
  }
};
