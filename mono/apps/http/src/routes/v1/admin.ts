import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import {
  createAvatarSchema,
  createElementSchema,
  createMapSchema,
  UpdateElementSchema,
} from "../../types";
import client from "@repo/db/client";

export const adminRouter = Router();
adminRouter.use(adminMiddleware);

adminRouter.post("/element", async (req, res) => {
  const parsedData = createElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation Failed!");
    return;
  }

  const element = await client.element.create({
    data: {
      imageUrl: parsedData.data.imageUrl,
      width: parsedData.data.width,
      height: parsedData.data.height,
      static: parsedData.data.static,
    },
  });

  // return the element id:
  res.json({ id: element.id });
});

adminRouter.put("/element/:elementId", async (req, res) => {
  const parsedData = UpdateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation Failed!");
    return;
  }

  const element = await client.element.update({
    where: {
      id: req.params.elementId,
    },
    data: {
      imageUrl: parsedData.data.imageUrl,
    },
  });

  res.json({ message: "Element updated!" });
});

adminRouter.post("/avatar", async (req, res) => {
  const parsedData = createAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation Failed!");
    return;
  }

  const avatar = await client.avatar.create({
    data: {
      imageUrl: parsedData.data.imageUrl,
      name: parsedData.data.name,
    },
  });

  res.json({ id: avatar.id });
});

adminRouter.post("/:map", async (req, res) => {
  const parsedData = createMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation Failed!");
    return;
  }

  const map = await client.map.create({
    data: {
      name: parsedData.data.name,
      width: parseInt(parsedData.data.dimensions.split("x")[0]),
      height: parseInt(parsedData.data.dimensions.split("x")[1]),
      thumbnail: parsedData.data.thumbnail,
      mapElements: {
        create: parsedData.data.defaultElements.map((e) => ({
          elementId: e.elementId,
          x: e.x,
          y: e.y,
        })),
      },
    },
  });

  res.json({ id: map.id });
});
