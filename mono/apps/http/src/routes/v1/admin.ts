import { Router } from "express";

export const adminRouter = Router();

adminRouter.post("/element", (req, res) => {
  res.json({ message: "Elements!" });
});

adminRouter.put("/element/:elementId", (req, res) => {
  res.json({ message: "Element!" });
});

adminRouter.get("/avatar", (req, res) => {
  res.json({ message: "avatar!" });
});

adminRouter.post("/:map", (req, res) => {
  res.json({ message: "map!" });
});
