import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import { prismaClient } from "@repo/db";

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

        if (parsedData.type === "shape:create") {
          const roomId = Number(parsedData.roomId);
          const shape = parsedData.shape;
          const clientId = parsedData.clientId;

          if (!roomId || !clientId || !shape || typeof shape.id !== "string" || typeof shape.type !== "string") {
            console.error("Invalid shape:create payload", parsedData);
            return;
          }

          console.log("WS CREATE", shape.strokeColor, shape.strokeWidth);


          const strokeColor = typeof shape.strokeColor === "string" ? shape.strokeColor : "#ffffff";
          const strokeWidth =
            typeof shape.strokeWidth === "number" ? shape.strokeWidth : 2;


          await prismaClient.shape.create({
            data: {
              id: shape.id,
              roomId,
              type: shape.type,
              data: shape,
              strokeColor,
              strokeWidth
            },
          });


          for (const u of users) {
            if (u.rooms.includes(roomId)) {
              u.ws.send(JSON.stringify({
                type: "shape:create",
                roomId,
                clientId,
                shape: { ...shape, strokeColor, strokeWidth },
              }));
            }
          }

          return;
        }

        //delete
        if (parsedData.type === "shape:delete") {
          const roomId = Number(parsedData.roomId);
          const shapeId = parsedData.shapeId;
          const clientId = parsedData.clientId;

          if (!roomId || !shapeId) {
            console.error("Invalid shape:delete payload", parsedData);
            return;
          }

          const result = await prismaClient.shape.updateMany({
            where: { id: shapeId, roomId, deleted: false },
            data: { deleted: true },
          });

          if (result.count === 0) {
            console.warn("Delete ignored: shape not found", { shapeId, roomId });
            return;
          }

          for (const u of users) {
            if (u.rooms.includes(roomId)) {
              u.ws.send(JSON.stringify({
                type: "shape:delete",
                roomId,
                shapeId,
                clientId
              }));
            }
          }

          return;
        }

        //update
        if (parsedData.type === "shape:update") {
          const roomId = Number(parsedData.roomId);
          const shapeId = parsedData.shapeId;
          const patch = parsedData.data;
          const clientId = parsedData.clientId;

          if (!roomId || !shapeId || !patch) {
            console.error("Invalid shape:update payload", parsedData);
            return;
          }

          const existing = await prismaClient.shape.findFirst({
            where: { id: shapeId, roomId, deleted: false },
            select: { data: true }
          })

          if (!existing) {
            console.warn("Update ignored: shape not found", { shapeId, roomId });
            return;
          }

          const mergedData = { ...(existing.data as any), ...(patch as any) };

          const strokeColor = typeof patch.strokeColor === "string" ? patch.strokeColor : undefined;
          const strokeWidth = typeof patch.strokeWidth === "number" ? patch.strokeWidth : undefined;

          await prismaClient.shape.updateMany({
            where: { id: shapeId, roomId, deleted: false },
            data: {
              data: mergedData,
              ...(strokeColor ? { strokeColor } : {}),
              ...(strokeWidth ? { strokeWidth } : {}),
            },
          });

          for (const u of users) {
            if (u.rooms.includes(roomId)) {
              u.ws.send(JSON.stringify({
                type: "shape:update",
                roomId,
                shapeId,
                clientId,
                data: patch,
              }));
            }
          }

          return;
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
