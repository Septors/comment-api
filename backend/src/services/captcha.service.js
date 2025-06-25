import svgCaptcha from "svg-captcha";
import { v4 as uuidv4 } from "uuid";


const createAndSetCaptcha = async () => {
  const captchaId = uuidv4();
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 3,
    color: true,
  });

  const key = `captcha:${captchaId}`;
  const ttl = 300;


  return {
    id: captchaId,
    svg: captcha.data,
    text: captcha.text,
  };
};

export default createAndSetCaptcha;
