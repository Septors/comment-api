import prisma from "../config/prisma.js";
import {sharedRedis}  from "../config/redis.js";
import ApiError from "../utils/apiError.js";

export const checkEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUser = async (userName, email, hashedPassword) => {
  return await prisma.user.create({
    data: {
      userName,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });
};

export const updateToUser = async (id, password) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      password,
      role: USER,
    },
  });
};

export const saveRefreshToken = async (userId, token) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      currentRefreshToken: token,
    },
  });
};

export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const clearUserToken = async (id) => {
  await prisma.user.update({
    where: {
      id,
    },
    data: {
      currentRefreshToken: null,
    },
  });
};

export const getUserValideToken = async (id) => {
  const userToken = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      currentRefreshToken: true,
    },
  });
  if (!userToken) {
    throw new ApiError(403, "Unauthorization: user havn't valide token");
  }
  return userToken.currentRefreshToken;
};

export const matchToken = async (id, currentToken) => {
  const validToken = await getUserValideToken(id);
  return validToken === currentToken ? validToken : false;
};

export const sendUserTokenToBlacklist = async (accessToken) => {
  await redisClient.set(`blackList:${accessToken}`, "1", "EX", 900);
};
