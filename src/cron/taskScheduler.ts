import cron from "node-cron";
import DailyVocabulary from "../models/dailyVocabulary.model";
import User from "../models/userModel";
import VocabularyList from "../data/words"; // Danh sách từ vựng có sẵn trong hệ thống

cron.schedule("22 23 * * *", async () => { 
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

      const now = new Date();
      const utcTimestamp = now.getTime() + (now.getTimezoneOffset() * 6000);
      const vnTime = new Date(utcTimestamp + (7 * 3600 * 1000));

      await DailyVocabulary.create({
        userId: user._id,
        words: todayWords,
        date: vnTime, // Lưu ngày với múi giờ +7
        progress: 0,
        lastLearnedIndex: lastIndex + (10 - remainingWords.length),
      });
    }

    console.log("✅ Cron Job: Assigned daily vocabulary!");
  } catch (error) {
    console.error("❌ Cron Job Error:", error);
  }
});
