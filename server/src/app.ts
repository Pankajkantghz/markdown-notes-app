import express from "express";
import cors from "cors";
import noteRoutes from "./routes/note.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/notes", noteRoutes);
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
