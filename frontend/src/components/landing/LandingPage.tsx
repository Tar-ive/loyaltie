import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/landing/Reveal";
import {
  CheckoutMock,
  ModelSwapMock,
  MoodGraphic,
  PersonaChatMock,
  ProfileLearningMock,
  PunchCardGraphic,
  SlackSummaryMock,
  StrangerGraphic,
} from "@/components/landing/LandingGraphics";

const GITHUB_URL = "https://github.com/Tar-ive/loyaltie";
const DEMO_TWEET_URL = "https://x.com/saksham_adh/status/1982489137111560450";

const problems = [
  {
    eyebrow: "Regulars get treated like strangers",
    title: "Every order starts from zero",
    description:
      "A restaurant's best customers order again and again, often for whole teams. Yet every phone call, chatbot and ordering app greets them like it's the first time: same questions, same full menu, no memory of the 46 orders that came before.",
    graphic: <StrangerGraphic />,
  },
  {
    eyebrow: "Context is everything",
    title: "The same person isn't the same at 9 AM and 8 PM",
    description:
      "On Monday morning a customer wants a quick decision. On Thursday afternoon they're planning a team event and open to ideas. At 8 PM they're hungry and it's urgent. Good hosts read the room. Most ordering software can't.",
    graphic: <MoodGraphic />,
  },
  {
    eyebrow: "Loyalty ≠ points",
    title: "Loyalty programs count visits, not people",
    description:
      "Punch cards and point balances reward frequency, but they don't know what you like, who you're feeding or how you want to be spoken to. Loyaltie turns a customer's history into a living profile the agent actually uses.",
    graphic: <PunchCardGraphic />,
  },
];

const modes = [
  {
    time: "Mon–Tue · 8–10 AM",
    name: "Monday morning",
    style: "Structured",
    text: "Efficient and to the point. Quick decisions, minimal small talk, options in bullets.",
  },
  {
    time: "11 AM–1 PM",
    name: "Midday",
    style: "Balanced",
    text: "The default working-hours voice: professional, clear and concise.",
  },
  {
    time: "4–6 PM",
    name: "Late afternoon",
    style: "Collaborative",
    text: "More room for detail and suggestions. Good for planning team lunches and events.",
  },
  {
    time: "8 PM +",
    name: "Evening",
    style: "Urgent",
    text: "Empathetic and fast. Streamlined choices so dinner is sorted in a few turns.",
  },
];

const features = [
  {
    badge: "Persona-aware",
    title: "An agent that knows who it's talking to",
    description:
      "Each customer has a rich profile: identity, communication style, hero dishes, dietary needs, budget comfort range and personal touches. It's built into the system prompt, so the agent leads with the right dishes, respects allergies and matches how the customer likes to talk.",
    mock: <PersonaChatMock />,
  },
  {
    badge: "Gets smarter every order",
    title: "A profile that learns from every conversation",
    description:
      "After each session, the Profile Updater extracts new learnings (delivery addresses, event types, budget patterns, preferences) and tags each with a confidence level and an append, replace or merge action. Nothing is saved until it's approved, and every update is backed up first.",
    mock: <ProfileLearningMock />,
  },
  {
    badge: "From chat to paid",
    title: "Orders that close themselves",
    description:
      "An order state machine moves each conversation from chatting to confirming, processing and completed. The agent drafts the order from the conversation, detects a yes, and hands off to Stripe Checkout with a clickable payment link.",
    mock: <CheckoutMock />,
  },
  {
    badge: "Personal touches",
    title: "Summaries ready to share with the team",
    description:
      "Team orders need buy-in. When a customer's profile says they share plans in Slack, Loyaltie ends with a bullet summary they can paste straight in, down to the sustainable packaging they care about.",
    mock: <SlackSummaryMock />,
  },
  {
    badge: "Powered by NVIDIA Nemotron",
    title: "Swap in Nemotron with one flag",
    description:
      "Agents run on the OpenAI Agents SDK, and a single environment flag routes them to NVIDIA Llama 3.1 Nemotron Ultra (253B) through OpenRouter. A built-in performance tracker records latency and tokens per second so you can compare models side by side.",
    mock: <ModelSwapMock />,
  },
];

const steps = [
  { title: "Recognize", text: "Loads the customer's profile and order history the moment a session starts." },
  { title: "Read the room", text: "Detects the time of day and switches to the matching conversation mode." },
  { title: "Curate", text: "Leads with hero dishes, fits the budget and headcount, and explains pairings." },
  { title: "Close", text: "Confirms the draft and sends a Stripe Checkout link, plus a shareable summary." },
  { title: "Learn", text: "Proposes profile updates from the conversation, so the next order is even faster." },
];

const stack = ["OpenAI Agents SDK", "NVIDIA Nemotron", "OpenRouter", "Stripe", "Next.js", "Express + OpenAPI", "TypeScript"];

const team = [
  {
    name: "Saksham Adhikari",
    photo: "/images/team/saksham.jpg",
    github: "https://github.com/Tar-ive",
    roles: ["2x Intern @ AskSLM", "6x Hackathon Winner", "Google TPU Research Cloud Grantee"],
  },
  {
    name: "Sharan Murli",
    photo: "/images/team/sharan.jpg",
    github: "https://github.com/sharanmurli",
    roles: ["MS Computer Science @ USC"],
  },
  {
    name: "Darshan Rao",
    photo: "/images/team/darshan.jpg",
    github: "https://github.com/darshanrao",
    roles: ["University of Southern California"],
  },
];

function Arrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Reveal className="mx-auto mb-20 max-w-2xl text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">{title}</h2>
      <p className="text-lg leading-relaxed text-stone-500">{subtitle}</p>
    </Reveal>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBF8F1] text-stone-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-bold tracking-[0.3em]">LOYALTIE</Link>
          <div className="hidden items-center gap-10 text-sm font-medium text-stone-500 md:flex">
            <a href="#demo" className="transition-colors hover:text-stone-900">Demo</a>
            <a href="#problem" className="transition-colors hover:text-stone-900">Problem</a>
            <a href="#idea" className="transition-colors hover:text-stone-900">The idea</a>
            <a href="#features" className="transition-colors hover:text-stone-900">Features</a>
            <a href="#team" className="transition-colors hover:text-stone-900">Team</a>
          </div>
          <a href={GITHUB_URL} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700">
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Hyper-personalized ordering agents</p>
            <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Every regular deserves{" "}
              <span className="bg-gradient-to-r from-amber-500 to-emerald-700 bg-clip-text text-transparent">to be remembered.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-stone-500">
              Loyaltie redefines how you order food. Its AI agents know each customer&apos;s tastes, budget and team, adapt their tone to the time of
              day, take the order through to Stripe checkout, and learn something new from every conversation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="#demo" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-emerald-800 px-8 text-base font-medium text-white shadow-lg shadow-emerald-800/25 transition-colors hover:bg-emerald-900">
                Watch the demo <Arrow />
              </a>
              <a href={GITHUB_URL} className="inline-flex h-14 items-center rounded-2xl border border-stone-300 px-8 text-base font-medium text-stone-700 transition-colors hover:bg-white">
                View on GitHub
              </a>
            </div>
          </Reveal>

          <Reveal delay={200} className="mx-auto mt-16 max-w-5xl">
            <div id="demo" className="scroll-mt-24 overflow-hidden rounded-3xl border border-stone-200 bg-stone-950 shadow-2xl shadow-stone-400/40">
              <video
                className="aspect-video h-auto w-full bg-stone-950"
                src="/video/loyaltie-demo.mp4"
                poster="/video/loyaltie-demo-poster.jpg"
                controls
                playsInline
                preload="metadata"
              >
                Your browser can&apos;t play this video. <a href={DEMO_TWEET_URL}>Watch it on X</a>.
              </video>
            </div>
            <p className="mt-4 text-center text-sm text-stone-500">
              Presenting Loyaltie at the AITX hackathon with NVIDIA ·{" "}
              <a href={DEMO_TWEET_URL} className="underline decoration-stone-300 underline-offset-4 hover:text-stone-700">
                Watch on X
              </a>
            </p>
          </Reveal>

          <Reveal>
            <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 text-center">
              {[
                ["4", "time-of-day conversation modes"],
                ["1 profile", "that grows with every order"],
                ["253B", "Nemotron Ultra, one flag away"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-bold tracking-tight md:text-3xl">{value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-stone-500 md:text-sm">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="The Problem" subtitle="Restaurants know their regulars by face. Their ordering software doesn't know them at all." />
          <div className="space-y-28">
            {problems.map((problem, i) => (
              <Reveal key={problem.title}>
                <div className={`flex flex-col items-center gap-12 md:gap-24 ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                  <div className="flex-1">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{problem.eyebrow}</p>
                    <h3 className="mb-6 text-3xl font-bold leading-tight md:text-4xl">{problem.title}</h3>
                    <p className="text-lg leading-relaxed text-stone-500">{problem.description}</p>
                  </div>
                  <div className="flex w-full flex-1 justify-center">{problem.graphic}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Idea */}
      <section id="idea" className="bg-[#16261D] py-28 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl">Serve the customer in front of you, at the moment they&apos;re in.</h2>
            <p className="text-lg leading-relaxed text-stone-400">
              A great host doesn&apos;t greet a hurried Monday regular the way they greet a Friday-night dinner party. Loyaltie pairs each customer&apos;s
              profile with the time of day and picks one of four conversation modes, so the same agent sounds right every time.
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modes.map((m, i) => (
              <Reveal key={m.name} delay={i * 120}>
                <div className="h-full rounded-2xl border border-emerald-900 bg-emerald-950/60 p-7">
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 font-mono text-xs font-semibold text-amber-300">{m.style}</span>
                    <span className="whitespace-nowrap text-right text-xs text-stone-500">{m.time}</span>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm leading-relaxed text-stone-400">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <code className="rounded-lg bg-emerald-950 px-3 py-2 font-mono text-sm text-stone-300">npm run persona -- --time=evening</code>
            <p className="mt-3 text-sm text-stone-500">Auto-detected from the clock, or overridden to try each mode.</p>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#FBF8F1] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            title="What Loyaltie does"
            subtitle="Five pieces that turn a generic ordering bot into a host who knows your name, your team and your usual."
          />
          <div className="space-y-32">
            {features.map((feature, i) => (
              <Reveal key={feature.title}>
                <div className={`flex flex-col items-center gap-12 md:gap-20 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="flex-1">
                    <span className="mb-5 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                      {feature.badge}
                    </span>
                    <h3 className="mb-6 text-3xl font-bold leading-tight md:text-4xl">{feature.title}</h3>
                    <p className="text-lg leading-relaxed text-stone-500">{feature.description}</p>
                  </div>
                  <div className="w-full max-w-xl flex-1">{feature.mock}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading title="How it works" subtitle="Here's what happens when a regular messages to order lunch for the team." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-stone-200 bg-[#FBF8F1] p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-mono text-sm font-semibold text-emerald-800">{i + 1}</div>
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-stone-500">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16 flex flex-wrap justify-center gap-3">
            {stack.map((s) => (
              <span key={s} className="rounded-full border border-stone-200 px-4 py-1.5 text-sm text-stone-600">
                {s}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="bg-[#2B1D12] py-28">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mx-auto mb-20 max-w-2xl text-center">
            <h2 className="mb-5 text-4xl font-bold tracking-tight text-[#FBF6EC] md:text-6xl">Meet the team.</h2>
            <p className="text-lg leading-relaxed text-stone-300">We built Loyaltie in a weekend at the AITX hackathon in Austin.</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-3 sm:gap-x-6">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 100} className="text-center">
                <a href={member.github} className="group inline-block">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={400}
                    height={400}
                    className="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-[#1C130B] object-cover transition-transform group-hover:scale-105 md:h-36 md:w-36"
                  />
                  <h3 className="text-lg font-semibold text-amber-400 md:text-xl">{member.name}</h3>
                </a>
                <ul className="mt-2 space-y-1 text-sm text-stone-300">
                  {member.roles.map((role) => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-24">
        <Reveal className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Stop greeting regulars like strangers.</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-stone-800/80">
            Loyaltie remembers the order, reads the moment and closes the sale, then gets a little better for next time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={GITHUB_URL} className="inline-flex h-14 items-center gap-2 rounded-2xl bg-stone-900 px-8 text-lg font-medium text-white transition-colors hover:bg-stone-800">
              Explore the code <Arrow />
            </a>
            <a href="#demo" className="inline-flex h-14 items-center rounded-2xl border border-stone-900/20 px-8 text-lg font-medium text-stone-900 transition-colors hover:bg-white/30">
              Watch the demo
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-[#FBF8F1] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <span className="text-sm font-bold tracking-[0.3em] text-stone-500">LOYALTIE</span>
          <p className="text-sm text-stone-400">
            Built at AITX ·{" "}
            <Link href="/chat" className="underline decoration-stone-300 underline-offset-4 hover:text-stone-600">Chat app</Link> ·{" "}
            <a href={GITHUB_URL} className="underline decoration-stone-300 underline-offset-4 hover:text-stone-600">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
