
import ApiError from "../utils/apiError.js";
import { verifyToken } from "../utils/jwtToken.js";

const checkCaptcha = async (req, res, next) => {
  const { captchaId, captchaText, ...rest } = req.body;
    req.body = rest;

  next();
};

export default checkCaptcha;
