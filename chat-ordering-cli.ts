import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import { AgentInputItem, Runner } from "@openai/agents";

import {
  greeting,
  ordering,
  finalizer,
  parseJSON,
  OrderDraft,
  OrderItem,
} from "./chat-ordering-workflow";

const ROOT_DIR = __dirname;

const BULK_UPSELL: OrderItem = {
  name: "Masala chai growler (serves 12)",
  quantity: 2,
  notes: "Pairs well with breakfast spreads",
};

const SINGLE_UPSELL: OrderItem = {
  name: "Mango lassi",
  quantity: 1,
  notes: "Great add-on with spicy mains",
};

type CsvRow = Record<string, string>;

type BulkHistoryRecord = {
  orderNumber: number;
  orderDate: string;
  menuBreakdown: string;
  finalValue: number;
  notes: string;
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === "\"") {
      const next = line[i + 1];
      if (insideQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

async function readCsv(fileName: string): Promise<CsvRow[]> {
  try {
    const filePath = path.resolve(ROOT_DIR, fileName);
    const raw = await fs.readFile(filePath, "utf8");
    const rows = raw.trim().split(/\r?\n/);
    if (!rows.length) return [];
    const headers = parseCsvLine(rows[0]!);

    return rows.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row: CsvRow = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? "";
      });
      return row;
    });
  } catch (error) {
    return [];
  }
}

async function loadBulkHistory(customerName: string): Promise<BulkHistoryRecord[]> {
  const [orders, details] = await Promise.all([readCsv("orders.csv"), readCsv("order_details.csv")]);
  const lowerName = customerName.toLowerCase();

  const detailsMap = new Map<string, CsvRow>();
  details.forEach((row) => {
    const key = row.order_number ?? "";
    if (key) {
      detailsMap.set(key, row);
    }
  });

  return orders
    .filter((row) => row.customer_name?.toLowerCase() === lowerName)
    .map((row) => {
      const key = row.order_number ?? "";
      const detail = key ? detailsMap.get(key) ?? {} : {};
      return {
        orderNumber: Number(row.order_number ?? detail.order_number ?? "0"),
        orderDate: detail.order_date ?? "",
        menuBreakdown: detail.menu_breakdown ?? "",
        finalValue: Number(detail.final_order_value ?? row.order_value ?? "0"),
        notes: detail.notes ?? row.order_context ?? "",
      };
    })
    .filter((record) => record.orderNumber > 0)
    .sort((a, b) => b.orderNumber - a.orderNumber);
}

function formatItems(items: OrderItem[]): string {
  if (!items.length) return "(no items captured)";
  return items
    .map((item) => {
      const base = `${item.quantity}× ${item.name}`;
      return item.notes ? `${base} — ${item.notes}` : base;
    })
    .join("\n");
}

function formatHistory(records: BulkHistoryRecord[], maxEntries = 3): string {
  if (!records.length) {
    return "No prior bulk orders on file.";
  }

  return records
    .slice(0, maxEntries)
    .map((record) => {
      const lines = [
        `#${record.orderNumber} · ${record.orderDate}`,
        `Total: $${record.finalValue.toFixed(2)}`,
        record.notes ? `Notes: ${record.notes}` : undefined,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");
}

async function ask(rl: ReturnType<typeof createInterface>, prompt: string): Promise<string> {
  const answer = await rl.question(prompt);
  return answer.trim();
}

async function askNonEmpty(rl: ReturnType<typeof createInterface>, prompt: string): Promise<string> {
  while (true) {
    const response = await ask(rl, prompt);
    if (response) return response;
    console.log("Please enter a response.");
  }
}

async function askYesNo(rl: ReturnType<typeof createInterface>, prompt: string, defaultYes = false): Promise<boolean> {
  while (true) {
    const suffix = defaultYes ? "[Y/n]" : "[y/N]";
    const answer = (await ask(rl, `${prompt} ${suffix} `)).toLowerCase();
    if (!answer && defaultYes) return true;
    if (!answer && !defaultYes) return false;
    if (["y", "yes"].includes(answer)) return true;
    if (["n", "no"].includes(answer)) return false;
    console.log("Please respond with 'y' or 'n'.");
  }
}

async function finalizeOrder(
  runner: Runner,
  conversationHistory: AgentInputItem[],
  draft: OrderDraft
): Promise<string> {
  conversationHistory.push({
    role: "assistant",
    status: "completed",
    type: "message",
    content: [
      {
        type: "output_text",
        text: "FINALIZE THIS JSON ORDER DRAFT:\n" + JSON.stringify(draft, null, 2),
      },
    ],
  });

  const finalRes = await runner.run(finalizer, [...conversationHistory]);
  if (!finalRes.finalOutput) {
    throw new Error("Finalizer agent result is undefined");
  }

  conversationHistory.push(...finalRes.newItems.map((item) => item.rawItem));
  return finalRes.finalOutput;
}

async function runBulkFlow(options: {
  rl: ReturnType<typeof createInterface>;
  runner: Runner;
  conversationHistory: AgentInputItem[];
  draft: OrderDraft;
  customerName: string;
}): Promise<void> {
  const { rl, runner, conversationHistory, draft, customerName } = options;

  console.log("\n[Bulk order records]");
  const history = await loadBulkHistory(customerName);
  console.log(formatHistory(history));

  console.log("\n[Validate / create docs]");
  if (!draft.items.length) {
    console.log("No items captured. You'll need to re-enter the request.");
    return;
  }
  console.log("Items captured:");
  console.log(formatItems(draft.items));

  draft.meta = draft.meta ?? {};

  if (!draft.meta.needed_by) {
    const neededBy = await askNonEmpty(rl, "When do you need the order? ");
    draft.meta.needed_by = neededBy;
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: `Needed by: ${neededBy}` }],
    });
  }

  const address = await ask(rl, "Delivery address (leave blank to skip): ");
  if (address) {
    draft.meta.address = address;
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: `Delivery address: ${address}` }],
    });
  }

  console.log("\n[Present order info]");
  console.log(formatItems(draft.items));

  console.log("\n[Ask more personal questions]");
  if (!draft.meta.contact) {
    const contact = await ask(rl, "Who should we reach out to on delivery day? ");
    if (contact) {
      draft.meta.contact = contact;
      conversationHistory.push({
        role: "user",
        content: [{ type: "input_text", text: `Primary contact: ${contact}` }],
      });
    }
  } else {
    console.log(`Contact on file: ${draft.meta.contact}`);
  }

  console.log("\n[Upsell]");
  console.log(`Suggestion: Add ${BULK_UPSELL.quantity}× ${BULK_UPSELL.name}.`);
  const addUpsell = await askYesNo(rl, "Add the suggested catering beverage?", false);
  if (addUpsell) {
    draft.items.push({ ...BULK_UPSELL });
    console.log("Upsell added.");
  } else {
    console.log("Skipping upsell.");
  }

  console.log("\n[Confirm]");
  console.log("Current order summary:");
  console.log(formatItems(draft.items));

  const confirm = await askYesNo(rl, "Ready to confirm this bulk order?", true);
  if (!confirm) {
    console.log("Bulk order not confirmed. Restart the flow to make changes.");
    return;
  }

  draft.status = "approved";
  conversationHistory.push({
    role: "user",
    content: [{ type: "input_text", text: "Confirming the bulk order now." }],
  });

  console.log("\n[Process checkout]");
  const receipt = await finalizeOrder(runner, conversationHistory, draft);
  console.log(receipt);

  console.log("\n[Output]");
  console.log("Order confirmed. You'll receive follow-up details shortly.");
}

async function runSingleFlow(options: {
  rl: ReturnType<typeof createInterface>;
  runner: Runner;
  conversationHistory: AgentInputItem[];
  draft: OrderDraft;
}): Promise<void> {
  const { rl, runner, conversationHistory, draft } = options;

  if (!draft.items.length) {
    console.log("Ordering agent could not detect items. Please try again.");
    return;
  }

  draft.meta = draft.meta ?? {};

  console.log("\n[Ask for confirmation]");
  console.log("Current items:");
  console.log(formatItems(draft.items));
  const proceed = await askYesNo(rl, "Does this look right?", true);
  if (!proceed) {
    console.log("No worries—restart the session to adjust the items.");
    return;
  }

  if (!draft.meta.needed_by) {
    const neededBy = await ask(rl, "When do you need it? (press enter to skip) ");
    if (neededBy) {
      draft.meta.needed_by = neededBy;
      conversationHistory.push({
        role: "user",
        content: [{ type: "input_text", text: `Needed by: ${neededBy}` }],
      });
    }
  }

  console.log("\n[Upsell]");
  console.log(`How about adding ${SINGLE_UPSELL.name}?`);
  const addUpsell = await askYesNo(rl, "Add the suggested treat?", false);
  if (addUpsell) {
    draft.items.push({ ...SINGLE_UPSELL });
    console.log("Upsell added.");
  } else {
    console.log("Skipping upsell.");
  }

  console.log("\n[Confirm]");
  console.log("Updated items:");
  console.log(formatItems(draft.items));
  const confirm = await askYesNo(rl, "Confirm the order?", true);
  if (!confirm) {
    console.log("Order not confirmed—restart if you need to adjust it.");
    return;
  }

  draft.status = "approved";
  conversationHistory.push({
    role: "user",
    content: [{ type: "input_text", text: "Confirming the order now." }],
  });

  console.log("\n[Process checkout]");
  const receipt = await finalizeOrder(runner, conversationHistory, draft);
  console.log(receipt);

  console.log("\n[Output]");
  console.log("Order confirmed. Enjoy your meal!");
}

async function main() {
  console.log("Welcome to the Loyaltie ordering CLI. Type your responses and press enter.");

  const rl = createInterface({ input, output });
  const runner = new Runner({ traceMetadata: { __trace_source__: "cli-ordering" } });
  const conversationHistory: AgentInputItem[] = [];

  const customerName = await askNonEmpty(rl, "First, what's your name? ");
  conversationHistory.push({
    role: "user",
    content: [{ type: "input_text", text: `My name is ${customerName}.` }],
  });

  const initialRequest = await askNonEmpty(rl, "What would you like to order today? ");
  conversationHistory.push({
    role: "user",
    content: [{ type: "input_text", text: initialRequest }],
  });

  const greetRes = await runner.run(greeting, [...conversationHistory]);
  if (!greetRes.finalOutput) {
    throw new Error("Greeting agent result is undefined");
  }
  conversationHistory.push(...greetRes.newItems.map((item) => item.rawItem));

  console.log("\n[Greeting agent]");
  console.log(greetRes.finalOutput.trim());

  let classification: "bulk" | "single";
  while (true) {
    const answer = (await askNonEmpty(rl, "Is this a bulk or individual order? (bulk/individual) ")).toLowerCase();
    if (answer.startsWith("b")) {
      classification = "bulk";
      break;
    }
    if (answer.startsWith("i") || answer.startsWith("s")) {
      classification = "single";
      break;
    }
    console.log("Please type 'bulk' or 'individual'.");
  }

  console.log(`\n[Routing] → ${classification === "bulk" ? "Bulk order flow" : "Single order flow"}`);

  conversationHistory.push({
    role: "user",
    content: [{ type: "input_text", text: `This should be treated as a ${classification} order.` }],
  });

  const orderingRes = await runner.run(ordering, [...conversationHistory]);
  if (!orderingRes.finalOutput) {
    throw new Error("Ordering agent result is undefined");
  }
  conversationHistory.push(...orderingRes.newItems.map((item) => item.rawItem));

  const parsed = parseJSON<OrderDraft>(orderingRes.finalOutput);
  if (!parsed.ok || !parsed.data) {
    console.log("I couldn’t parse the order details. Please re-run the CLI with clearer items.");
    rl.close();
    return;
  }

  const draft = parsed.data;
  draft.classification = classification;
  draft.status = "needs_approval";

  if (classification === "bulk") {
    await runBulkFlow({ rl, runner, conversationHistory, draft, customerName });
  } else {
    await runSingleFlow({ rl, runner, conversationHistory, draft });
  }

  rl.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
