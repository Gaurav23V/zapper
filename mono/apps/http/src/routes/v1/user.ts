import { Router } from "express";

export const userRouter = Router();

userRouter.post("/metadata", (req, res) => {
  res.json({ message: "Metadata!" });
});

userRouter.get("/metadata/bulk", (req, res) => {
  res.json({ message: "Bulk Metadata!" });
});
