import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import * as messageService from "../rc/services/message-service";

const app = express();
const PORT = process.env.PORT || 8000;

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    detail: err.message || "Internal server error",
  });
};

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Clay Pit AI API Documentation"
}));

// Health check endpoints
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Clay Pit AI API is running",
    version: "1.0.0",
    documentation: "/api-docs"
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy" });
});

// Session endpoints
app.post("/api/v1/sessions/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customer_id, customer_name } = req.body;

    if (!customer_id || !customer_name) {
      return res.status(400).json({
        detail: "customer_id and customer_name are required",
      });
    }

    const session = await messageService.createSession(customer_id, customer_name);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/sessions/customer/:customerId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const sessions = await messageService.listSessions(customerId);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/sessions/:sessionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const session = await messageService.getSession(sessionId);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/v1/sessions/:sessionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    await messageService.deleteSession(sessionId);
    res.json({
      status: "deleted",
      session_id: sessionId,
    });
  } catch (error) {
    next(error);
  }
});

// Message endpoints
app.post("/api/v1/messages/session/:sessionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        detail: "message is required",
      });
    }

    const result = await messageService.sendMessage(sessionId, message);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/messages/session/:sessionId/conversation", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const conversation = await messageService.getConversation(sessionId);
    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/messages/session/:sessionId/logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const logs = await messageService.getSessionLogs(sessionId);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
