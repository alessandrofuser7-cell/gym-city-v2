import type { Express } from "express";
import { type Server } from "http";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import coursesRoutes from "./routes/courses";
import scheduleRoutes from "./routes/schedule";
import bookingsRoutes from "./routes/bookings";
import adminRoutes from "./routes/admin";
import { setupCronJobs } from "./jobs/cron-scheduler";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // Setup cron jobs (backup + notifiche)
  setupCronJobs();

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/schedule", scheduleRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/admin", adminRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
