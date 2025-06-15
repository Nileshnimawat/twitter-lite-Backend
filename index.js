import { server } from "./socket/socket.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server and Socket.IO listening at port:", PORT);
});