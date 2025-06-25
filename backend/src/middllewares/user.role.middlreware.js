import { v4 as uuidv4 } from "uuid";
import prisma from "../config/prisma.js";
import { createToken } from "../utils/jwtToken.js";

export const checkTypeUser = async (req, res, next) => {
  const authHeader = req.headers.authorization?.split(" ")[1];
  const { userName, email } = req.body;

  if (authHeader) {
    return next();
  }
  const user = await prisma.user.create({
    data: {
      userName,
      email: `guest-${uuidv4()}@guest.com`,
    },
  });

  const { accessToken, refreshToken } = createToken({
    id: user.id,
    role: user.role,
  });

  req.guestToken = accessToken;
  next();
};
