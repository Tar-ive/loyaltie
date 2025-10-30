import dotenv from "dotenv";
// Force override of system environment variables with .env file
dotenv.config({ override: true });

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import * as messageService from "../rc/services/message-service";
import { performanceTracker } from "../rc/utils/performance-tracker";

const app = express();
const PORT = process.env.PORT || 8000;

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

// Request logging middleware (BEFORE other middleware)
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  console.log("\n" + "=".repeat(80));
  console.log(`📥 INCOMING REQUEST [${requestId}]`);
  console.log(`   Time: ${timestamp}`);
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'no-origin'}`);
  console.log(`   User-Agent: ${req.headers['user-agent'] || 'unknown'}`);
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`   Params:`, JSON.stringify(req.params, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`   Query:`, JSON.stringify(req.query, null, 2));
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Capture the original res.json to log responses
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    console.log(`📤 RESPONSE [${requestId}]`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Body:`, JSON.stringify(body, null, 2).substring(0, 500));
    console.log("=".repeat(80) + "\n");
    return originalJson(body);
  };
  
  next();
});

// CORS middleware with detailed logging
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error("\n" + "⚠️ ".repeat(40));
  console.error("❌ ERROR OCCURRED:");
  console.error("   Message:", err.message || "Unknown error");
  console.error("   Status:", err.status || 500);
  console.error("   Stack:", err.stack);
  console.error("⚠️ ".repeat(40) + "\n");
  
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
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    model: process.env.USE_NEMOTRON === 'true' ? 'nemotron' : 'openai'
  });
});

// Test endpoint for frontend connectivity
app.get("/api/v1/test", (req: Request, res: Response) => {
  console.log("🧪 TEST ENDPOINT HIT - Frontend connection successful!");
  res.json({
    success: true,
    message: "Backend is reachable!",
    timestamp: new Date().toISOString(),
    backend_config: {
      use_nemotron: process.env.USE_NEMOTRON === 'true',
      model: process.env.USE_NEMOTRON === 'true' ? 'nvidia/nemotron-ultra' : 'gpt-4.1/gpt-5'
    }
  });
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

// Performance endpoints
app.get("/api/v1/performance/metrics", (req: Request, res: Response) => {
  try {
    const summary = performanceTracker.getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ detail: "Failed to get performance metrics" });
  }
});

app.get("/api/v1/performance/details", (req: Request, res: Response) => {
  try {
    const metrics = performanceTracker.getMetrics();
    res.json({ metrics, count: metrics.length });
  } catch (error) {
    res.status(500).json({ detail: "Failed to get performance details" });
  }
});

app.post("/api/v1/performance/export", (req: Request, res: Response) => {
  try {
    performanceTracker.exportMetrics();
    res.json({ 
      status: "exported", 
      file: "performance-metrics.json",
      message: "Metrics exported to project root" 
    });
  } catch (error) {
    res.status(500).json({ detail: "Failed to export metrics" });
  }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("\n" + "🚀".repeat(40));
  console.log("🚀 SERVER STARTED SUCCESSFULLY");
  console.log("🚀".repeat(40));
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  
  console.log("\n" + "⚙️ ".repeat(40));
  console.log("⚙️  CONFIGURATION:");
  console.log("⚙️ ".repeat(40));
  console.log(`   PORT: ${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   USE_NEMOTRON: ${process.env.USE_NEMOTRON || 'false'}`);
  
  if (process.env.USE_NEMOTRON === 'true') {
    console.log(`   🚀 USING: NVIDIA Nemotron via OpenRouter`);
    console.log(`   🔑 OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? '✅ SET' : '❌ MISSING'}`);
  } else {
    console.log(`   🤖 USING: OpenAI GPT-4.1/GPT-5`);
    console.log(`   🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ SET' : '❌ MISSING'}`);
  }
  
  console.log("\n" + "📡".repeat(40));
  console.log("📡 AVAILABLE ENDPOINTS:");
  console.log("📡".repeat(40));
  console.log("   GET    /                              - Server info");
  console.log("   GET    /health                        - Health check");
  console.log("   POST   /api/v1/sessions/              - Create session");
  console.log("   GET    /api/v1/sessions/customer/:id  - List customer sessions");
  console.log("   GET    /api/v1/sessions/:id           - Get session details");
  console.log("   DELETE /api/v1/sessions/:id           - Delete session");
  console.log("   POST   /api/v1/messages/session/:id   - Send message");
  console.log("   GET    /api/v1/messages/session/:id/conversation - Get conversation");
  console.log("   GET    /api/v1/messages/session/:id/logs        - Get session logs");
  console.log("   GET    /api/v1/performance/metrics    - Performance summary");
  console.log("   GET    /api/v1/performance/details    - Performance details");
  console.log("   POST   /api/v1/performance/export     - Export metrics");
  
  console.log("\n" + "✨".repeat(40));
  console.log("✨ Server is ready to accept requests!");
  console.log("✨ Watch this console for detailed request/response logs");
  console.log("✨".repeat(40) + "\n");
});

export default app;
