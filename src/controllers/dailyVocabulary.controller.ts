import { Request, Response } from "express";
import DailyVocabulary from "../models/dailyVocabulary.model";

export const getDailyVocabulary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    // Lấy ngày hiện tại theo múi giờ +7, chỉ giữ phần ngày (YYYY-MM-DD)
    const now = new Date();
    const vnTodayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(now)
      .replace(/\//g, "-");

    // Tìm dữ liệu theo ngày (không quan tâm đến giờ)
    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: vnTodayStr, // So sánh với chuỗi "YYYY-MM-DD"
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

    // Lấy ngày hiện tại theo múi giờ +7, chỉ giữ phần ngày (YYYY-MM-DD)
    const now = new Date();
    const vnTodayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(now)
      .replace(/\//g, "-");

    // Tìm dữ liệu theo ngày
    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: vnTodayStr, // So sánh với chuỗi "YYYY-MM-DD"
    });

    if (!dailyVocabulary) {
      return res.status(404).json({
        data: null,
        status: "error",
        message: "No vocabulary assigned for today",
      });
    }

    // Lọc danh sách các từ chưa học
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

    // Lấy ngày hiện tại theo múi giờ +7, chỉ giữ phần ngày (YYYY-MM-DD)
    const now = new Date();
    const vnTodayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(now)
      .replace(/\//g, "-");

    // Tìm dữ liệu theo ngày
    const dailyVocabulary = await DailyVocabulary.findOne({
      userId,
      date: vnTodayStr, // So sánh với chuỗi "YYYY-MM-DD"
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
