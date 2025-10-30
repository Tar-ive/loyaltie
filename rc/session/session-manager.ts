import fs from "node:fs/promises";
import path from "node:path";
import { AgentInputItem } from "@openai/agents";
import { AniketProfile } from "../persona-agent";

export type OrderPhase = "chatting" | "confirming" | "processing" | "completed";

export interface OrderState {
  phase: OrderPhase;
  draft?: OrderDraft;
  orderId?: string;
}

export interface OrderDraft {
  items: Array<{ name: string; quantity: number; notes?: string }>;
  deliveryDate?: string;
  deliveryAddress?: string;
  contact?: string;
  estimatedTotal?: number;
}

export interface SessionMetadata {
  sessionId: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  lastAccessedAt: string;
  status: "active" | "completed" | "abandoned";
  conversationTurns: number;
  ordersPlaced: number;
}

export interface SessionState {
  conversationHistory: AgentInputItem[];
  orderState: OrderState;
  contextVariables: Record<string, any>;
  profileUpdates: Partial<AniketProfile>;
}

export interface Session {
  metadata: SessionMetadata;
  state: SessionState;
}

export class SessionManager {
  private sessionsDir: string;
  private currentSession: Session | null = null;

  constructor() {
    this.sessionsDir = path.resolve(__dirname, "../../sessions");
  }

  async createSession(
    customerId: string,
    customerName: string
  ): Promise<Session> {
    const sessionId = `sess_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    const session: Session = {
      metadata: {
        sessionId,
        customerId,
        customerName,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        status: "active",
        conversationTurns: 0,
        ordersPlaced: 0,
      },
      state: {
        conversationHistory: [],
        orderState: { phase: "chatting" },
        contextVariables: {},
        profileUpdates: {},
      },
    };

    this.currentSession = session;
    await this.saveSession(session);

    return session;
  }

  async resumeSession(sessionId: string): Promise<Session> {
    const sessionPath = path.resolve(
      this.sessionsDir,
      sessionId,
      "session.json"
    );

    try {
      const data = await fs.readFile(sessionPath, "utf8");
      const session: Session = JSON.parse(data);

      session.metadata.lastAccessedAt = new Date().toISOString();
      this.currentSession = session;

      return session;
    } catch (error) {
      throw new Error(`Failed to resume session ${sessionId}: ${error}`);
    }
  }

  async listActiveSessions(customerId: string): Promise<SessionMetadata[]> {
    try {
      await fs.mkdir(this.sessionsDir, { recursive: true });
      const dirs = await fs.readdir(this.sessionsDir, { withFileTypes: true });
      const sessions: SessionMetadata[] = [];

      for (const dir of dirs) {
        if (!dir.isDirectory()) continue;

        try {
          const sessionPath = path.resolve(
            this.sessionsDir,
            dir.name,
            "session.json"
          );
          const data = await fs.readFile(sessionPath, "utf8");
          const session: Session = JSON.parse(data);

          if (
            session.metadata.customerId === customerId &&
            session.metadata.status === "active"
          ) {
            sessions.push(session.metadata);
          }
        } catch (e) {
          // Skip invalid sessions
        }
      }

      return sessions.sort(
        (a, b) =>
          new Date(b.lastAccessedAt).getTime() -
          new Date(a.lastAccessedAt).getTime()
      );
    } catch (error) {
      // Sessions directory doesn't exist yet
      return [];
    }
  }

  async saveSession(session: Session): Promise<void> {
    const sessionDir = path.resolve(
      this.sessionsDir,
      session.metadata.sessionId
    );
    await fs.mkdir(sessionDir, { recursive: true });

    const sessionPath = path.resolve(sessionDir, "session.json");
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), "utf8");
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  updateConversationHistory(history: AgentInputItem[]): void {
    if (this.currentSession) {
      this.currentSession.state.conversationHistory = history;
      this.currentSession.metadata.conversationTurns = history.filter(
        (h) => "role" in h && h.role === "user"
      ).length;
    }
  }

  updateOrderState(orderState: OrderState): void {
    if (this.currentSession) {
      this.currentSession.state.orderState = orderState;
      if (orderState.phase === "completed" && orderState.orderId) {
        this.currentSession.metadata.ordersPlaced++;
      }
    }
  }

  setContextVariable(key: string, value: any): void {
    if (this.currentSession) {
      this.currentSession.state.contextVariables[key] = value;
    }
  }

  getContextVariable(key: string): any {
    return this.currentSession?.state.contextVariables[key];
  }

  recordProfileUpdate(path: string, value: any): void {
    if (this.currentSession) {
      this.currentSession.state.profileUpdates[path] = value;
    }
  }

  async closeSession(status: "completed" | "abandoned"): Promise<void> {
    if (this.currentSession) {
      this.currentSession.metadata.status = status;
      await this.saveSession(this.currentSession);
    }
  }

  async getSession(sessionId: string): Promise<Session> {
    const sessionPath = path.resolve(
      this.sessionsDir,
      sessionId,
      "session.json"
    );

    try {
      const data = await fs.readFile(sessionPath, "utf8");
      const session: Session = JSON.parse(data);
      this.currentSession = session;
      return session;
    } catch (error) {
      throw new Error(`Failed to get session ${sessionId}: ${error}`);
    }
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionState>
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    
    if (updates.conversationHistory) {
      session.state.conversationHistory = updates.conversationHistory;
    }
    if (updates.orderState) {
      session.state.orderState = updates.orderState;
    }
    if (updates.contextVariables) {
      session.state.contextVariables = {
        ...session.state.contextVariables,
        ...updates.contextVariables,
      };
    }
    if (updates.profileUpdates) {
      session.state.profileUpdates = {
        ...session.state.profileUpdates,
        ...(updates.profileUpdates as Record<string, any>),
      } as Partial<AniketProfile>;
    }

    session.metadata.lastAccessedAt = new Date().toISOString();
    session.metadata.conversationTurns = session.state.conversationHistory.filter(
      (h) => "role" in h && h.role === "user"
    ).length;

    await this.saveSession(session);
  }
}
