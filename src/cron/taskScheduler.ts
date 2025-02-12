import cron from "node-cron";
import DailyVocabulary from "../models/dailyVocabulary.model";
import User from "../models/userModel";
import VocabularyList from "../data/words"; // Danh sách từ vựng có sẵn trong hệ thống

cron.schedule("01 00 * * *", async () => { 
  try {
    const users = await User.find();

    for (const user of users) {
      const lastDaily = await DailyVocabulary.findOne({
        userId: user._id,
      }).sort({ date: -1 });

      let lastIndex = lastDaily ? lastDaily.lastLearnedIndex : 0;
      let remainingWords = lastDaily
        ? lastDaily.words.filter((w) => !(w as any).learned)
        : [];
      let newWords = VocabularyList.slice(
        lastIndex,
        lastIndex + (10 - remainingWords.length)
      );

      const todayWords = [...remainingWords, ...newWords].map((w) => ({
        ...w,
        learned: false,
      }));

      // Lấy ngày hiện tại theo múi giờ +7 và chỉ lấy phần ngày (YYYY-MM-DD)
      const now = new Date();
      const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // Chuyển thành chuỗi "YYYY-MM-DD"

      await DailyVocabulary.create({
        userId: user._id,
        words: todayWords,
        date: vnDate, // Chỉ lưu ngày
        progress: 0,
        lastLearnedIndex: lastIndex + (10 - remainingWords.length),
      });
    }

    console.log("✅ Cron Job: Assigned daily vocabulary!");
  } catch (error) {
    console.error("❌ Cron Job Error:", error);
  }
});
