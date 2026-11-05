import http from "http";
import { PORT } from "./utils/confing.js";
import app from "./app.js";


const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
