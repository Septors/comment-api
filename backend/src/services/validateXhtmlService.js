import ApiError from "../utils/apiError.js";
const allowedTags = ["a", "code", "i", "strong"];
const allowedAttrs = {
  a: ["href", "title"],
  code: [],
  i: [],
  strong: [],
};

export function validateTags(input) {
  const tagRegex = /<\/?([a-zA-Z0-9]+)(\s[^>]*?)?>/g;
  let match;

  while ((match = tagRegex.exec(input)) !== null) {
    const tag = match[1].toLowerCase();
    const isClosing = match[0].startsWith("</");
    const attrs = match[2] || "";

    if (!allowedTags.includes(tag)) {
      throw new ApiError(
        400,
        `Заборонений тег: <${isClosing ? "/" : ""}${tag}>`
      );
    }

    if (!isClosing && attrs.trim()) {
      const attrRegex = /([a-zA-Z0-9:_-]+)\s*=\s*(['"])(.*?)\2/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        if (!allowedAttrs[tag].includes(attrName)) {
          throw new ApiError(
            400,
            `Заборонений атрибут '${attrName}' в тегі <${tag}>`
          );
        }
      }
    }
  }
}

export function validateTagPairs(input) {
  const tagStack = [];
  const tagRegex = /<\/?([a-zA-Z0-9]+)(\s[^>]*?)?>/g;
  let match;

  while ((match = tagRegex.exec(input)) !== null) {
    const tag = match[1].toLowerCase();
    const isClosing = match[0].startsWith("</");

    if (isClosing) {
      const last = tagStack.pop();
      if (last !== tag) {
        throw new ApiError(
          400,
          `Невірне закриття: очікувалось </${last}>, отримано </${tag}>`
        );
      }
    } else {
      tagStack.push(tag);
    }
  }

  if (tagStack.length > 0) {
    throw new ApiError(
      400,
      `Залишились незакриті теги: ${tagStack.join(", ")}`
    );
  }
}

export function validateXhtml(input) {
  validateTags(input);
  validateTagPairs(input);
}
