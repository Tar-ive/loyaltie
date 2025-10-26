import "dotenv/config";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { getReasoningModel } from "../config/model-config";

/** ---------- Types ---------- */
export type WorkflowInput = { input_as_text: string };

export type OrderItem = {
  name: string;
  quantity: number;
  notes?: string;
};

export type OrderDraft = {
  classification: "bulk" | "single";
  items: OrderItem[];
  meta?: Record<string, string>;
  status: "needs_approval" | "approved";
  confirmation_prompt?: string; // what to ask the user if approval is needed
};

export type ParsedResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export function parseJSON<T>(text: string): ParsedResult<T> {
  try {
    // extract the last JSON block if the model wrote prose around it
    const match = text.match(/\{[\s\S]*\}$/);
    const json = JSON.parse(match ? match[0] : text) as T;
    return { ok: true, data: json };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to parse JSON" };
  }
}

/** ---------- Agents ---------- */
export const greeting = new Agent({
  name: "Greeting",
  instructions: [
    "You are a concise, friendly concierge for an ordering flow.",
    "Task: Acknowledge the user's request in one short sentence and ask at most ONE missing key detail if needed.",
    "If the user already stated what they want, do not ask extra questions. Keep it brief.",
  ].join("\n"),
  model: getReasoningModel(),
  modelSettings: { reasoning: { effort: "low" }, store: true },
});

export const ordering = new Agent({
  name: "Ordering",
  instructions: [
    "You are the Ordering Agent. Classify as 'bulk' when the user is ordering for multiple people, events, teams, offices, or total quantity >= 10; otherwise 'single'.",
    "Extract items with name and quantity. If quantity is missing, default to 1.",
    "If the user has already confirmed (phrases like 'confirm', 'place it', 'go ahead'), set status='approved'. Else status='needs_approval' and provide a short confirmation_prompt.",
    "ALWAYS respond with JSON and NOTHING else, with shape:",
    "{",
    '  "classification": "bulk" | "single",',
    '  "items": [{"name": string, "quantity": number, "notes"?: string}],',
    '  "meta"?: {"needed_by"?: string, "address"?: string, "contact"?: string},',
    '  "status": "needs_approval" | "approved",',
    '  "confirmation_prompt"?: string',
    "}",
  ].join("\n"),
  model: getReasoningModel(),
  modelSettings: { reasoning: { effort: "low" }, store: true },
});

export const finalizer = new Agent({
  name: "Finalizer",
  instructions: [
    "You finalize an already APPROVED order draft.",
    "Input will include a JSON with items and meta. Produce a short, crisp human-facing receipt:",
    "- Order ID (generate a short friendly ID like ORD-XYZ123)",
    "- Classification (Bulk/Single)",
    "- Line items with qty × name",
    "- Optional meta (needed_by, address, contact) if present",
    "- Clear next step (e.g., 'You'll receive an email shortly').",
    "Keep it to 5-7 lines max.",
  ].join("\n"),
  model: getReasoningModel(),
  modelSettings: { reasoning: { effort: "low" }, store: true },
});

/** ---------- Approval helpers ---------- */
export const looksApproved = (userText: string) =>
  /\b(confirm|confirmed|approve|approved|place it|place the order|go ahead|sounds good|yes\b|yep|do it)\b/i.test(
    userText.trim()
  );

/**
 * Computes approval from either the model-produced draft or the latest user message.
 * If either indicates approval, we return true.
 */
export function approvalFromDraftOrUser(
  draft: OrderDraft,
  latestUserText: string
): boolean {
  if (draft.status === "approved") return true;
  return looksApproved(latestUserText);
}

/** ---------- Main workflow ---------- */
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("Agent builder workflow", async () => {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: workflow.input_as_text }],
      },
    ];

    const runner = new Runner({
      traceMetadata: { __trace_source__: "agent-builder" },
    });

    // 1) Greet
    const greetRes = await runner.run(greeting, [...conversationHistory]);
    if (!greetRes.finalOutput) throw new Error("Greeting agent result is undefined");
    conversationHistory.push(...greetRes.newItems.map((i) => i.rawItem));

    // 2) Ordering (auto-classify + draft)
    const orderingRes = await runner.run(ordering, [...conversationHistory]);
    if (!orderingRes.finalOutput) throw new Error("Ordering agent result is undefined");
    conversationHistory.push(...orderingRes.newItems.map((i) => i.rawItem));

    const parsed = parseJSON<OrderDraft>(orderingRes.finalOutput);
    if (!parsed.ok || !parsed.data) {
      // If parsing failed, surface a helpful message for the chat UI to continue.
      return {
        status: "needs_clarification",
        message:
          "I couldn’t parse the order details. Could you rephrase the items and quantities? Example: '3x medium pizzas, 1x salad. Needed by Friday, deliver to 123 Main St.'",
      };
    }

    const draft = parsed.data;

    // 3) Confirmation loop (single-turn guard):
    // If not approved yet, return the confirmation prompt for the chat to collect user approval.
    const userText = workflow.input_as_text;
    const approved = approvalFromDraftOrUser(draft, userText);

    if (!approved) {
      // Ask for approval; the client should feed the user's reply back through runWorkflow().
      const prompt =
        draft.confirmation_prompt ??
        "Please confirm your order (reply 'confirm' to place it).";
      return {
        status: "awaiting_approval",
        classification: draft.classification,
        items: draft.items,
        meta: draft.meta ?? {},
        confirmation_prompt: prompt,
      };
    }

    // 4) Finalize
    // Ensure we pass the structured draft forward as context.
    conversationHistory.push({
      role: "assistant",
      status: "completed",
      type: "message",
      content: [
        {
          type: "output_text",
          text:
            "FINALIZE THIS JSON ORDER DRAFT:\n" + JSON.stringify(draft, null, 2),
        },
      ],
    });

    const finalRes = await runner.run(finalizer, [...conversationHistory]);
    if (!finalRes.finalOutput) throw new Error("Finalizer agent result is undefined");
    conversationHistory.push(...finalRes.newItems.map((i) => i.rawItem));

    // 5) Return final output for display
    return {
      status: "success",
      classification: draft.classification,
      order: draft,
      receipt_text: finalRes.finalOutput,
    };
  });
};

if (require.main === module) {
  const input = process.argv.slice(2).join(" ") || "I need 12 breakfast burritos for the office tomorrow.";
  runWorkflow({ input_as_text: input })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
