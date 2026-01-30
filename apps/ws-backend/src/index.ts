import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: number[];
  userId: string;
}

const users: User[] = [];

/* -------------------- AUTH -------------------- */
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded === "string") return null;
    if (!decoded.userId) return null;

    return decoded.userId as string;
  } catch {
    return null;
  }
}

/* -------------------- WS CONNECTION -------------------- */
wss.on("connection", (ws, request) => {
  try {
    const url = request.url;
    if (!url) {
      ws.close();
      return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") ?? "";

    const userId = checkUser(token);
    if (!userId) {
      ws.close();
      return;
    }

    const user: User = {
      ws,
      userId,
      rooms: [],
    };

    users.push(user);

    /* -------------------- MESSAGE HANDLER -------------------- */
    ws.on("message", async (data) => {
      try {
        const parsedData = JSON.parse(data.toString());

        /* JOIN ROOM */
        if (parsedData.type === "join_room") {
          const roomId = Number(parsedData.roomId);
          if (!roomId) return;

          if (!user.rooms.includes(roomId)) {
            user.rooms.push(roomId);
          }
          return;
        }

        /* LEAVE ROOM */
        if (parsedData.type === "leave_room") {
          const roomId = Number(parsedData.roomId);
          user.rooms = user.rooms.filter((r) => r !== roomId);
          return;
        }

        /* CHAT / DRAW EVENT */
        if (parsedData.type === "chat") {
          console.log("faahhhhhhhhhhhh", parsedData);
          const roomId = Number(parsedData.roomId);
          const message = parsedData.message;

          if (!roomId || !message) {
            console.error("Invalid chat payload", parsedData);
            return;
          }

          /* ---- SAVE TO DB (SAFE) ---- */
          try {
            await prismaClient.chat.create({
              data: {
                message,
                roomId: Number(roomId),
                userId,
              },
            });
          } catch (dbError) {
            console.error("DB error while saving chat:", dbError);
            return; // VERY IMPORTANT
          }

          /* ---- BROADCAST ---- */
          for (const u of users) {
            if (u.rooms.includes(roomId)) {
              u.ws.send(
                JSON.stringify({
                  type: "chat",
                  message,
                  roomId,
                })
              );
            }
          }
        }
      } catch (err) {
        console.error("WS message error:", err);
      }
    });

    /* -------------------- CLEANUP -------------------- */
    ws.on("close", () => {
      const index = users.findIndex((u) => u.ws === ws);
      if (index !== -1) users.splice(index, 1);
    });
  } catch (err) {
    console.error("WS connection error:", err);
    ws.close();
  }
});

console.log("✅ WebSocket server running on ws://localhost:8080");
