import ApiError from "../utils/apiError.js";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const message = error.details[0].message;
      throw new ApiError(400, message);
    }

    req.body = value;
    next();
  };
};
export default validateRequest;
