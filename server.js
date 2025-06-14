import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
app.use(cors());
app.use(express.json());

const adapter = new JSONFile(".data/db.json");
const db = new Low(adapter);

const port = process.env.PORT || 3000;

const start = async () => {
  await db.read();
  db.data ||= { tasks: [] };

  app.get("/tasks", async (req, res) => {
    await db.read();
    res.json(db.data.tasks);
  });

  app.post("/tasks", async (req, res) => {
    const newTask = { id: Date.now(), ...req.body };
    db.data.tasks.push(newTask);
    await db.write();
    res.status(201).json(newTask);
  });

  app.put("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    const index = db.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      db.data.tasks[index] = { ...db.data.tasks[index], ...req.body };
      await db.write();
      res.json(db.data.tasks[index]);
    } else {
      res.status(404).send("Task not found");
    }
  });

  app.delete("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    db.data.tasks = db.data.tasks.filter(t => t.id !== id);
    await db.write();
    res.status(204).end();
  });

  app.listen(port, () => {
    console.log(`✅ 서버 실행 중: ${port}`);
  });
};

start();
