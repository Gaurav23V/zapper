import { Router } from "express";
import {
  addElementSchema,
  createSpaceSchema,
  deleteElementSchema,
} from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  console.log("DELETE /element route hit"); // Add this line at the very start
  console.log("Request method:", req.method);
  console.log("Request path:", req.path);
  try {
    console.log("Delete Element Endpoint Hit");
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);

    const parsedData = deleteElementSchema.safeParse(req.body);
    console.log("Validation result:", parsedData);

    if (!parsedData.success) {
      res.status(400).json({ message: "Validation Failed!" });
      return;
    }
    const spaceElement = await client.spaceElements.findFirst({
      where: {
        id: parsedData.data.id,
      },
      include: {
        space: true,
      },
    });

    console.log(spaceElement?.space);
    console.log("spaceElement?.space");

    if (
      !spaceElement?.space.creatorId ||
      spaceElement.space.creatorId !== req.userId
    ) {
      res.status(403).json({ message: "Unauthorized!" });
      return;
    }

    await client.spaceElements.delete({
      where: {
        id: parsedData.data.id,
      },
    });

    res.status(200).json({ message: "Element deleted!" });
  } catch (error) {
    console.error("Delete Element Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

spaceRouter.post("/", userMiddleware, async (req, res) => {
  try {
    console.log("Space creation endpoint");
    const parsedData = createSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
      console.log(JSON.stringify(parsedData));
      res.status(400).json({ message: "Validation Failed!" });
      return;
    }

    if (!parsedData.data.mapId) {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: parseInt(parsedData.data.dimensions.split("x")[0]),
          height: parseInt(parsedData.data.dimensions.split("x")[1]),
          creatorId: req.userId!,
        },
      });

      res.json({ spaceId: space.id });
      return; // Ensure the function exits after responding
    }

    const map = await client.map.findUnique({
      where: {
        id: parsedData.data.mapId,
      },
      select: {
        mapElements: true,
        width: true,
        height: true,
      },
    });

    if (!map) {
      res.status(404).json({ message: "Map not found!" });
      return;
    }

    let space = await client.$transaction(async () => {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId: req.userId!,
        },
      });

      await client.spaceElements.createMany({
        data: map.mapElements
          .filter(
            (element): element is typeof element & { x: number; y: number } =>
              element.x != null && element.y != null
          )
          .map((element) => ({
            spaceId: space.id,
            elementId: element.elementId,
            x: element.x,
            y: element.y,
          })),
      });

      return space;
    });

    res.json({ spaceId: space.id });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId,
      },
      select: {
        creatorId: true,
      },
    });

    if (!space) {
      res.status(400).json({ message: "Space not found" });
      return;
    }

    if (space?.creatorId !== req.userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await client.space.delete({
      where: {
        id: req.params.spaceId,
      },
    });
    res.json({ message: "Space deleted" });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await client.space.findMany({
    where: {
      creatorId: req.userId!,
    },
  });

  res.json({
    spaces: spaces.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail,
      dimensions: `${s.width}x${s.height}`,
    })),
  });
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = addElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation Failed!");
    return;
  }

  const space = await client.space.findUnique({
    where: {
      id: req.body.spaceId,
      creatorId: req.userId!,
    },
    select: {
      width: true,
      height: true,
    },
  });

  if (
    req.body.x < 0 ||
    req.body.y < 0 ||
    req.body.x > space?.width! ||
    req.body.y > space?.height!
  ) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (!space) {
    res.status(404).json({ message: "Space not found!" });
    return;
  }

  await client.spaceElements.create({
    data: {
      spaceId: req.body.spaceId,
      elementId: req.body.elementId,
      x: req.body.x,
      y: req.body.y,
    },
  });

  res.json({ message: "Element added!" });
});

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId,
      },
      include: {
        elements: {
          include: {
            element: true,
          },
        },
      },
    });

    if (!space) {
      res.status(404).json({ message: "Space not found!" });
      return;
    }

    res.status(200).json({
      dimensions: `${space.width}x${space.height}`,
      elements: space.elements.map((e) => ({
        id: e.id, // Correctly mapped SpaceElement ID
        element: {
          id: e.element.id,
          imageUrl: e.element.imageUrl,
          width: e.element.width,
          height: e.element.height,
          static: e.element.static,
        },
        x: e.x,
        y: e.y,
      })),
    });
  } catch (error) {
    console.error("Get Space Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
