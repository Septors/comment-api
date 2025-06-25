import express from "express";
import * as commentController from "..//controllers/comment.controller.js";
import checkCaptcha from "../middllewares/captcha.middleware.js";
import { checkTxtFileSize } from "../middllewares/checkTextFileSize.js";
import { upload } from "../middllewares/multer.middleware.js";
import decodeUserToken from "../middllewares/token.middlleware.js";
import { checkTypeUser } from "../middllewares/user.role.middlreware.js";
import validationMiddlewares from "../middllewares/validateSchema.middlleware.js";
import { validateXhtmlMiddleware } from "../middllewares/validateXhtmlMiddleware.js";
import catchAsync from "../utils/catchAsync.js";
import * as validationSchema from "../validation/comment.schema.js";

const commentRoutes = express.Router();

commentRoutes.post(
  "/",
  upload.single("file"),
  checkTxtFileSize,
  catchAsync(validationMiddlewares(validationSchema.commentSchema)),
  catchAsync(validateXhtmlMiddleware),
  catchAsync(checkTypeUser),
  catchAsync(checkCaptcha),
  catchAsync(decodeUserToken),
  catchAsync(commentController.createComment)
);

commentRoutes.get("/", catchAsync(commentController.getComment));

export default commentRoutes;
