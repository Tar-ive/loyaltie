// Illustrations for the landing page, drawn with markup instead of image files.

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-rose-500">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full max-w-[460px] rounded-3xl border border-stone-200 bg-white p-7 shadow-xl shadow-stone-200/60 ${className}`}>
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">{children}</span>
);

function Bubble({ from, children }: { from: "you" | "agent"; children: React.ReactNode }) {
  return from === "you" ? (
    <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-stone-900 px-4 py-2.5 text-sm text-white">{children}</div>
  ) : (
    <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-stone-100 px-4 py-2.5 text-sm leading-relaxed text-stone-700">{children}</div>
  );
}

/* ---------- The Problem ---------- */

export function StrangerGraphic() {
  return (
    <Card>
      <div className="mb-5 flex items-baseline justify-between">
        <Label>Order #47 from the same customer</Label>
      </div>
      <div className="space-y-3">
        <Bubble from="you">Lunch for 8 tomorrow, same as usual</Bubble>
        <Bubble from="agent">Welcome! What&apos;s your name? Would you like to see our full menu of 64 items?</Bubble>
        <Bubble from="you">…we order every week</Bubble>
        <Bubble from="agent">Sorry, I don&apos;t have access to previous orders. Any allergies?</Bubble>
      </div>
      <p className="mt-6 flex items-center gap-2 border-t border-stone-100 pt-5 text-sm text-stone-500">
        <Cross /> 46 orders of history, none of it used
      </p>
    </Card>
  );
}

export function MoodGraphic() {
  const moments = [
    { time: "Mon 9:05 AM", mood: "Heads-down. Wants a decision, not a menu.", tone: "bg-sky-100 text-sky-700" },
    { time: "Wed 12:30 PM", mood: "Normal day. Standard, efficient service.", tone: "bg-stone-100 text-stone-600" },
    { time: "Thu 4:45 PM", mood: "Planning a team event. Open to ideas.", tone: "bg-emerald-100 text-emerald-700" },
    { time: "Fri 8:20 PM", mood: "Hungry and late. Just make it happen.", tone: "bg-rose-100 text-rose-700" },
  ];
  return (
    <Card>
      <div className="mb-5">
        <Label>One customer, four moods</Label>
      </div>
      <ul className="space-y-3">
        {moments.map((m) => (
          <li key={m.time} className="flex items-start gap-3 rounded-xl border border-stone-100 p-3">
            <span className={`shrink-0 rounded-lg px-2 py-1 font-mono text-xs font-semibold ${m.tone}`}>{m.time}</span>
            <span className="text-sm text-stone-600">{m.mood}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-center gap-2 border-t border-stone-100 pt-5 text-sm text-stone-500">
        <Cross /> Most ordering bots answer all four the same way
      </p>
    </Card>
  );
}

export function PunchCardGraphic() {
  return (
    <Card>
      <div className="mb-5">
        <Label>What a loyalty program knows</Label>
      </div>
      <div className="mb-6 grid max-w-[260px] grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-full border-2 text-xs font-bold ${
              i < 7 ? "border-amber-500 bg-amber-50 text-amber-600" : "border-dashed border-stone-200 text-stone-300"
            }`}
          >
            {i < 7 ? "✓" : ""}
          </div>
        ))}
      </div>
      <div className="mb-5">
        <Label>What it should know</Label>
      </div>
      <ul className="space-y-2 text-sm text-stone-600">
        {["Always orders vegetarian-friendly for the team", "Comfortable budget: $40–150", "Bikes to work and cares about sustainable packaging", "Shares order summaries in Slack"].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Check /> {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Features ---------- */

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-300/60">
    <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
      <span className="ml-3 font-mono text-xs text-stone-400">{title}</span>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export function PersonaChatMock() {
  return (
    <Panel title="persona-chat · Monday morning · structured mode">
      <div className="space-y-3">
        <Bubble from="you">Need lunch for 8 people tomorrow</Bubble>
        <Bubble from="agent">
          Perfect, Aniket! Lunch for 8 tomorrow. Quick questions:
          <ul className="mt-2 list-disc space-y-0.5 pl-5">
            <li>What kind of event?</li>
            <li>Any dietary restrictions?</li>
            <li>Budget per person?</li>
          </ul>
        </Bubble>
        <Bubble from="you">Team meeting, vegetarian friendly, ~$15/person</Bubble>
        <Bubble from="agent">
          <span className="font-semibold">Hero dishes:</span> Palak Paneer (8) · Vegetable Biryani
          <br />
          <span className="font-semibold">Sides:</span> Garlic Naan (16) · Raita
          <br />
          <span className="font-semibold">Drinks:</span> Mango Lassi (8)
          <br />
          <span className="font-semibold">Total:</span> ~$120, team discount applied
        </Bubble>
      </div>
    </Panel>
  );
}

export function ProfileLearningMock() {
  const updates = [
    { field: "delivery_addresses", value: "+ 500 W 2nd St, Floor 4", conf: "high", action: "append" },
    { field: "event_types", value: "+ quarterly offsite (20–25 ppl)", conf: "high", action: "append" },
    { field: "budget.typical", value: "75 → 110", conf: "medium", action: "replace" },
    { field: "beverages", value: "+ Masala Chai (afternoons)", conf: "low", action: "merge" },
  ];
  const confTone: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-stone-100 text-stone-500",
  };
  return (
    <Panel title="profile-updater · 4 proposed learnings">
      <ul className="space-y-3">
        {updates.map((u) => (
          <li key={u.field} className="rounded-xl border border-stone-100 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-stone-400">{u.field}</span>
              <span className="flex gap-1.5">
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${confTone[u.conf]}`}>{u.conf}</span>
                <span className="rounded-md bg-stone-900 px-1.5 py-0.5 text-[11px] font-medium text-white">{u.action}</span>
              </span>
            </div>
            <p className="font-mono text-sm text-stone-700">{u.value}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-3">
        <span className="flex-1 rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-medium text-white">Approve all</span>
        <span className="flex-1 rounded-xl border border-stone-200 py-2.5 text-center text-sm font-medium text-stone-600">Review each</span>
      </div>
    </Panel>
  );
}

export function CheckoutMock() {
  const states = ["chatting", "confirming", "processing", "completed"];
  return (
    <Panel title="order state · confirming">
      <div className="mb-6 flex items-center gap-1.5">
        {states.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
            <div className={`h-1.5 w-full rounded-full ${i <= 1 ? "bg-amber-500" : "bg-stone-200"}`} />
            <span className={`font-mono text-[11px] ${i === 1 ? "font-semibold text-amber-700" : "text-stone-400"}`}>{s}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Order draft</p>
        <ul className="space-y-1.5 text-sm text-stone-700">
          {[
            ["Palak Paneer × 8", "$56.00"],
            ["Vegetable Biryani, family", "$24.00"],
            ["Garlic Naan × 16", "$24.00"],
            ["Mango Lassi × 8", "$28.00"],
            ["Team discount", "−$12.00"],
          ].map(([item, price]) => (
            <li key={item} className="flex justify-between">
              <span>{item}</span>
              <span className="font-mono">{price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 font-semibold">
          <span>Total</span>
          <span className="font-mono">$120.00</span>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-[#635BFF] py-3 text-center text-sm font-medium text-white">Pay with Stripe Checkout →</div>
    </Panel>
  );
}

export function SlackSummaryMock() {
  return (
    <Panel title="#team-lunch">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">A</div>
        <div className="min-w-0">
          <p className="text-sm">
            <span className="font-semibold">Aniket</span> <span className="text-xs text-stone-400">11:42 AM</span>
          </p>
          <p className="mt-1 text-sm text-stone-600">Lunch is sorted for tomorrow 🎉</p>
          <ul className="mt-2 space-y-1 border-l-4 border-stone-200 pl-3 text-sm text-stone-700">
            <li>• 8-person vegetarian spread</li>
            <li>• Palak Paneer + Veg Biryani (mains)</li>
            <li>• Garlic Naan + Raita (sides)</li>
            <li>• Mango Lassi (drinks)</li>
            <li>• $120 total, delivery tomorrow</li>
            <li>• ♻️ Sustainable packaging</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}

export function ModelSwapMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl shadow-stone-300/60">
      <div className="flex items-center gap-1.5 border-b border-stone-800 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
        <span className="ml-3 font-mono text-xs text-stone-500">terminal</span>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-stone-300">
        <span className="text-stone-500"># .env</span>
        {"\n"}
        <span className="text-emerald-400">USE_NEMOTRON</span>=true{"\n"}
        <span className="text-emerald-400">OPENROUTER_API_KEY</span>=sk-or-…{"\n\n"}
        <span className="text-stone-500">$</span> npm run server{"\n"}
        <span className="text-amber-300">🚀 Using NVIDIA Nemotron via OpenRouter</span>
        {"\n"}
        <span className="text-stone-500">   model: nvidia/llama-3.1-nemotron-ultra-253b-v1</span>
        {"\n\n"}
        <span className="text-stone-500">$</span> curl localhost:8000/api/v1/performance/metrics{"\n"}
        {"{ "}
        <span className="text-sky-300">&quot;totalRequests&quot;</span>, <span className="text-sky-300">&quot;avgDurationMs&quot;</span>,{" "}
        <span className="text-sky-300">&quot;avgTokensPerSecond&quot;</span>
        {" … }"}
      </pre>
    </div>
  );
}
