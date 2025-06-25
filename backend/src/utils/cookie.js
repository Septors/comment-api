export const setTokenCookie = async (res, token, name = "refreshToken") => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
export const clearTokenCookie = async (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
};
