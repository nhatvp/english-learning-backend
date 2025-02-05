import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  learnedWordsOverall: []; // danh sách từ đã học tổng thể
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  learnedWordsOverall: { type: [], default: [] }
});

export default mongoose.model<IUser>('User', userSchema);
