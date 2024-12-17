import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { SignupSchema } from "../../types";
import client from "@repo/db/client";

export const router = Router();

router.post("/signup", async (req, res) => {
  // check the user
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ error: parsedData.error });
    return;
  }

  try {
    // create the user
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: parsedData.data.password,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({ error: "User already exists" });
    return;
  }
});

router.post("/signin", (req, res) => {
  res.json({ message: "Signin!" });
});

router.get("/avatars", (req, res) => {
  res.json({ message: "Avatars!" });
});

router.get("/elements", (req, res) => {
  res.json({ message: "Elements!" });
});

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
