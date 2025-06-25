import svgCaptcha from "svg-captcha";
import { v4 as uuidv4 } from "uuid";
import {sharedRedis}  from "../config/redis.js";

const createAndSetCaptcha = async () => {
  const captchaId = uuidv4();
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 3,
    color: true,
  });

  const key = `captcha:${captchaId}`;
  const ttl = 300;
  await redisClient.setex(key, ttl, captcha.text);

  return {
    id: captchaId,
    svg: captcha.data,
    text: captcha.text,
  };
};

export default createAndSetCaptcha;
