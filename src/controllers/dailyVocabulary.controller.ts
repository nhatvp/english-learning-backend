import { Request, Response } from "express";
import DailyVocabulary from "../models/dailyVocabulary.model";
import { AuthRequest } from "../types/custom";

function convertToTimezone7(date: any) {
  const timezoneOffset = date.getTimezoneOffset() * 60000; // Lấy chênh lệch múi giờ của hệ thống
  const timezone7 = 7 * 3600000; // Múi giờ +7 (giờ tính bằng milisecond)
  return new Date(date.getTime() + timezoneOffset + timezone7);
}

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
    
export const getUnlearnedWords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    // Lấy thời gian hiện tại và chuyển đổi về múi giờ +7
    const now = new Date();
    const vnToday = convertToTimezone7(now);
    vnToday.setUTCHours(0, 0, 0, 0); // Thiết lập thời gian đầu ngày theo múi giờ +7

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
        message: "No vocabulary assigned for today",
      });
    }

    // Lấy danh sách các từ chưa được học
    const unlearnedWords = dailyVocabulary.words.filter((w) => !w.learned);

    return res.status(200).json({
      data: unlearnedWords,
      status: "success",
      message: "Retrieved unlearned words successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ data: null, status: "error", message: "Server error" });
  }
};

export const updateDailyVocabulary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { word } = req.body;

    // Lấy thời gian hiện tại và chuyển đổi về múi giờ +7
    const now = new Date();
    const vnToday = convertToTimezone7(now);
    vnToday.setUTCHours(0, 0, 0, 0); // Thiết lập thời gian đầu ngày theo múi giờ +7

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
        message: "No vocabulary assigned for today",
      });
    }

    // Cập nhật trạng thái "learned" của từ vựng được chỉ định
    const updatedWords = dailyVocabulary.words.map((w) =>
      w.word === word ? { ...w, learned: true } : w
    );

    // Tính lại tiến độ học tập
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
