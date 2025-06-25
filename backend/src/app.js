import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { handleErrorMidlleware } from "./middllewares/errorHandler.js";
import captchaRoutes from "./routes/captcha.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("__dirname:", __dirname);
const app = express();

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use((req, res, next) => {
  if (req.headers.upgrade) {
    console.log("Upgrade request:", req.headers.upgrade);
  }
  next();
});

app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get('/',(req,res) =>{
  res.send("Api is runing");
})
app.use("/user", userRoutes);
app.use("/comments", commentRoutes);
app.use("/captcha", captchaRoutes);

app.use(handleErrorMidlleware);

export default app;
