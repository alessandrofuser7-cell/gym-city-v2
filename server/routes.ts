import type { Express } from "express";
import { type Server } from "http";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import coursesRoutes from "./routes/courses";
import scheduleRoutes from "./routes/schedule";
import bookingsRoutes from "./routes/bookings";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/schedule", scheduleRoutes);
  app.use("/api/bookings", bookingsRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
