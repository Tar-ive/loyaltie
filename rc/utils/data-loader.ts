import fs from "node:fs/promises";
import path from "node:path";

export interface OrderHistory {
  orderNumber: number;
  orderDate: string;
  menuBreakdown: string;
  menuTotal: number;
  bulkDiscount: number;
  finalOrderValue: number;
  notes: string;
  context?: string;
}

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (insideQuotes && next === '"') {
        current += '"';
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
    const filePath = path.resolve(__dirname, "../../", fileName);
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
    console.error(`Failed to read CSV file ${fileName}:`, error);
    return [];
  }
}

export async function loadOrderHistory(
  customerName: string
): Promise<OrderHistory[]> {
  const [orders, details] = await Promise.all([
    readCsv("orders.csv"),
    readCsv("order_details.csv"),
  ]);

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
        menuTotal: Number(detail.menu_total ?? "0"),
        bulkDiscount: Number(detail.bulk_discount ?? "0"),
        finalOrderValue: Number(
          detail.final_order_value ?? row.order_value ?? "0"
        ),
        notes: detail.notes ?? "",
        context: row.order_context ?? "",
      };
    })
    .filter((record) => record.orderNumber > 0)
    .sort((a, b) => b.orderNumber - a.orderNumber);
}
