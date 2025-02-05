import { Request } from "express";

export interface AuthRequest extends Request {
  user?: { id: string }; // Có thể thêm các thông tin khác nếu cần
}
