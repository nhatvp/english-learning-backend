import { Request, Response } from "express";
import User from "../models/userModel";
import { successResponse, errorResponse } from "../utils/responseHelper";

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res
        .status(400)
        .json(errorResponse("User ID not found in request."));
    }

    const user = await User.findById(req.userId).select(
      "name username progress"
    );
    if (!user) {
      return res.status(404).json(errorResponse("User not found."));
    }

    res
      .status(200)
      .json(successResponse(user, "User profile fetched successfully."));
  } catch (error) {
    res.status(500).json(errorResponse("Server error."));
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const users = await User.find().select("name username progress");

    return res
      .status(200)
      .json(successResponse(users, "Users retrieved successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse("Server error", error));
  }
};
