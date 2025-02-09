import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/userModel";
import { generateToken } from "../utils/jwt";
import { successResponse, errorResponse } from "../utils/responseHelper";

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { username, name, password, email } = req.body;
  

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json(errorResponse("Username already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: IUser = new User({
      username,
      name,
      password: hashedPassword,
      email,
    });
    await user.save();

    return res
      .status(201)
      .json(successResponse(null, "User registered successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse("Server error", error));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json(errorResponse("User not found."));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(errorResponse("Invalid credentials."));
    }

    // Chỉ lưu `_id` vào token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json(successResponse({ token }, "Login successful."));
  } catch (error) {
    res.status(500).json(errorResponse("Server error."));
  }
};
