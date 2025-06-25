import redisClient from "../config/redis.js";
import ApiError from "../utils/apiError.js";
import { verifyToken } from "../utils/jwtToken.js";

const decodeUserToken = async (req, res, next) => {
  const authToken = req.headers.authorization?.split(" ")[1] || req.guestToken;

  if (!authToken) {
    throw new ApiError(401, "Unauthoriaztion: Token missing  or invalid");
  }

  const isBlackList = await redisClient.get(`blackList:${authToken}`);

  if (isBlackList) {
    throw new ApiError(401, "Access token is blackisted");
  }

  const decoded = verifyToken(authToken, "access");
  if (!decoded) {
    throw new ApiError(401, "Unauthorization: Token verifycation failed ");
  }

  req.user = {
    id: decoded.id,
    role: decoded.role,
    accessToken: authToken,
  };

  next();
};

export default decodeUserToken;
