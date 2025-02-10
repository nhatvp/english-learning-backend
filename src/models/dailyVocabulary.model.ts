import mongoose, { Document, Schema } from "mongoose";

export interface IVocabularyWord {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  learned?: boolean;
}

export interface IDailyVocabulary extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  words: IVocabularyWord[];
  date: Date;
  progress: number;
  lastLearnedIndex: number;
}

const vocabularyWordSchema: Schema = new Schema({
  word: { type: String, required: true },
  phonetic: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String, required: true },
  learned: { type: Boolean, default: false },
});

const dailyVocabularySchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  words: { type: [vocabularyWordSchema], required: true },
  date: { type: String, required: true },
  progress: { type: Number, default: 0 },
  lastLearnedIndex: { type: Number, default: 0 },
});

const DailyVocabulary = mongoose.model<IDailyVocabulary>("DailyVocabulary", dailyVocabularySchema);
export default DailyVocabulary;
