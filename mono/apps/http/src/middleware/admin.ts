import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export const adminMiddleware = (req, res, next) => {
  const header = req.header.authorization;
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
