import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
import cors from 'cors';

const app = express();
app.use(express.json()); 
app.use(
    cors({
        origin: ["http://localhost:3222",
            "https://excalidraw-web-ten.vercel.app/"
        ], 
    })
);

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log("this is the error::::::", parsedData);
        res.status(403).json({
            message: "invalid inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch (e) {
        console.log("errrrrrrr", e)
        res.status(411).json({
            message: "User already exists!"
        })
    }
})

app.post("/signin", async (req, res) => {

    const parsedData = SigninSchema.safeParse(req.body);
    console.log("adfadfjs", parsedData);
    if (!parsedData.success) {
        res.json({
            message: "invalid inputs"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET)

    res.json({
        token
    })
})
//for creating a room
app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid inputs"
        });

    }
    const userId = req.userId;
    console.log("thisss iss userrr iddd", userId);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }


    const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.name,
            adminId: userId
        }
    })

    res.json({
        roomId: room.id
    })
})

app.get("/rooms/:roomId/shapes", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);

        if (!(roomId)) {
            return res.status(400).json({ error: "Invalid roomId" });
        }

        const shapes = await prismaClient.shape.findMany({
            where: { roomId, deleted: false },
            orderBy: { createdAt: "asc"}
        });

        res.json({ shapes: shapes.map((s:any) => s.data) });
    } catch (err) {
        console.error("rooms/roomId/shapes endpoint error",err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });
    res.json({
        room
    })
})

app.listen(process.env.PORT || 3003);