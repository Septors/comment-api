import express from "express";
import { createCaptcha } from "../controllers/captcha.comtroller.js";

const captchaRoutes = express.Router();

captchaRoutes.get("/", createCaptcha);

export default captchaRoutes;
