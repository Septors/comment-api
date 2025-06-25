import express from "express";
import * as userController from "../controllers/user.controller.js";
import decodeUserToken from "../middllewares/token.middlleware.js";
import validateRequest from "../middllewares/validateSchema.middlleware.js";
import catchAsync from "../utils/catchAsync.js";
import * as valueSchema from "../validation/user.schema.js";

const userRoutes = express.Router();

userRoutes.post(
  "/register",
  catchAsync(validateRequest(valueSchema.registerSchema)),
  catchAsync(userController.registerUser)
);

userRoutes.post(
  "/login",
  catchAsync(validateRequest(valueSchema.loginSchema)),
  catchAsync(userController.loginUser)
);

userRoutes.delete(
  "/logout",
  catchAsync(decodeUserToken),
  catchAsync(userController.userlogout)
);

userRoutes.patch(
  "/refresh-token",
  catchAsync(decodeUserToken),
  catchAsync(userController.getNewToken)
);

export default userRoutes;
