import mongoose, { Schema } from "mongoose";

export interface IDailyVocabularyItem extends Document {
  userId: mongoose.Types.ObjectId;
  words: Array<{
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
  }>;
  date: Date;
  progress: number;
  lastLearnedIndex: number; // Chỉ số từ cuối cùng user đã học
}

const DailyVocabularySchema = new Schema<IDailyVocabularyItem>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  words: [
    {
      word: { type: String, required: true },
      phonetic: { type: String, required: true },
      meaning: { type: String, required: true },
      example: { type: String, required: true },
      learned: { type: Boolean, default: false }, // Thêm trường learned
    },
  ],
  date: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  lastLearnedIndex: { type: Number, default: 0 },
});

export default mongoose.model<IDailyVocabularyItem>(
  "DailyVocabulary",
  DailyVocabularySchema
);
