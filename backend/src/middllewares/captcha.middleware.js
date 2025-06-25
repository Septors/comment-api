
import ApiError from "../utils/apiError.js";
import { verifyToken } from "../utils/jwtToken.js";

const checkCaptcha = async (req, res, next) => {
  const { captchaId, captchaText, ...rest } = req.body;
  const authToken = req.headers.authorization?.split(" ")[1] || req.guestToken;

  const verifuUser = verifyToken(authToken, "access");

  if (verifuUser.role === "USER") {
    req.body = rest;
    return next();
  }
  if (!captchaId || !captchaText) {
    throw new ApiError(400, "CAPTCHA не введена");
  }

  next();
};

export default checkCaptcha;
