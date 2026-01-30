
import axios from "axios";

const API_URL = "http://localhost:3003";

export async function createRoom(name: string) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await axios.post(
    `${API_URL}/room`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data.roomId;
}
