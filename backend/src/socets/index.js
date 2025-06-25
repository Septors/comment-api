import WebSocket, { WebSocketServer } from "ws";
import "../events/image.ready.subscriber.js";
import eventEmitter from "../events/index.js";

let wss; // ← ОБЯЗАТЕЛЬНО объяви переменную здесь

export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New WS connection");

    ws.on("close", () => {
      console.log("WS client disconnected");
    });

    ws.on("error", (err) => {
      console.error("WS client error:", err);
    });
  });

  wss.on("error", (err) => {
    console.error("WS server error:", err);
  });

  eventEmitter.on("commentCreated", (comment) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "commentCreated", data: comment }));
      }
    });
  });

  eventEmitter.on("imageResized", (comment) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "imageResized", data: comment }));
      }
    });
  });
}
