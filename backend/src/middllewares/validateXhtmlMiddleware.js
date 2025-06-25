import { validateXhtml } from "../services/validateXhtmlService.js";
import ApiError from "../utils/apiError.js";

export function validateXhtmlMiddleware(req, res, next) {
  const message = req.body.text;
  if (!message || typeof message !== "string") {
    throw new ApiError(400, "Пустий або некоректний текст");
  }

  validateXhtml(message);
  next();
}
