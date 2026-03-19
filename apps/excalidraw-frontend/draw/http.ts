import { HTTP_BACKEND } from "@/config";
import axios from "axios";


export async function getExistingShapes(roomId: string) {
    const roomid = Number(roomId)
    const res = await axios.get(`${HTTP_BACKEND}/rooms/${roomid}/shapes`);
    return res.data.shapes;
}
