import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDb from "./db/connectDB.js";
import { initWebSocket } from "./socets/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initWebSocket(server);

const start = async () => {
  try {
    await connectDb();

    server.listen(PORT, () => {
      console.log(`Server started in PORT: ${PORT}`);
    });
  } catch (err) {
    console.error("Server error", err);
  }
};

start();
