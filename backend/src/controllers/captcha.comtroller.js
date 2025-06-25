import createAndSetCaptcha from "../services/captcha.service.js";
export const createCaptcha = async (req, res) => {
  const { id, svg, text } = await createAndSetCaptcha();
  res.status(201).json({ captchaId: id, captchaSvg: svg, captchaText: text ,text:"В гитхаб проекте капча зашивается в кеш и на входе проверяется с комментарием"});
};
