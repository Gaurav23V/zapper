import { Router } from "express";
import client from "@repo/db/client";
import { updateMetadataSchema } from "../../types";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = updateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation Failed!");
    return;
  }

  await client.user.update({
    where: {
      id: req.userId,
    },
    data: {
      avatarId: parsedData.data.avatarId,
    },
  });

  res.json({ message: "Metadata Updated!" });
});

userRouter.get("/metadata/bulk", userMiddleware, async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString?.length - 2).split(",");

  const metadata = await client.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      avatar: true,
      id: true,
    },
  });

  res.json({
    avatars: metadata.map((m) => ({
      userIds: m.id,
      avatarId: m.avatar?.imageUrl,
    })),
  });
});
