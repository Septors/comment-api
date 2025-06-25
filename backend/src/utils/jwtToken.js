import Jwt from "jsonwebtoken";

export const createToken = (uplaod) => {
  const accessToken = Jwt.sign(uplaod, process.env.ACCESS_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = Jwt.sign(uplaod, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token, typeToken) => {
  const secret =
    typeToken == "refresh"
      ? process.env.REFRESH_SECRET
      : process.env.ACCESS_SECRET;

  return Jwt.verify(token, secret);
};
