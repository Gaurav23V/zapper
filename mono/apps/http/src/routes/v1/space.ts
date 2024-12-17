import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.post("/", (req, res) => {
  res.json({ message: "Space!" });
});

spaceRouter.delete("/:spaceId", (req, res) => {
  res.json({ message: "Space deleted!" });
});

spaceRouter.post("/all", (req, res) => {
  res.json({ message: "All Spaces!" });
});

spaceRouter.post("/element", (req, res) => {
  res.json({ message: "Element added!" });
});

spaceRouter.delete("/element", (req, res) => {
  res.json({ message: "Element deleted!" });
});

spaceRouter.get("/:spaceId", (req, res) => {
  res.json({ message: "Get Space!" });
});
