import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export const PLATFORM_URL = "/auth";

function speak(text: string, lang = "en-GB") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

type Msg = { from: "tutor" | "you"; text: string };

const REPLIES: { keys: string[]; reply: string }[] = [
  { keys: ["coffee", "cappuccino", "latte", "tea", "espresso"], reply: "Lovely! Would you like that with regular or oat milk?" },
  { keys: ["croissant", "cake", "muffin", "sandwich", "eat", "food"], reply: "Excellent choice. Shall I warm it up for you?" },
  { keys: ["oat", "milk", "regular", "yes", "please"], reply: "Perfect. Will that be to have here or to take away?" },
  { keys: ["here", "take away", "takeaway", "to go"], reply: "Wonderful. That comes to £6.40. Card or cash?" },
  { keys: ["card", "cash", "pay"], reply: "Thank you so much! Your order will be ready in a moment." },
  { keys: ["thank", "thanks", "bye"], reply: "You're very welcome. Have a brilliant day!" },
  { keys: ["hello", "hi", "good morning", "hey"], reply: "Good morning! What can I get started for you today?" },
];

function tutorReply(input: string) {
  const t = input.toLowerCase();
  const hit = REPLIES.find((r) => r.keys.some((k) => t.includes(k)));
  let tip = "";
  if (/\bi want\b/.test(t)) tip = " (Tip: \"I'd like...\" sounds more polite than \"I want...\")";
  else if (!/please/.test(t) && t.split(" ").length > 2) tip = " (Tip: adding \"please\" sounds friendlier.)";
  return (hit?.reply ?? "Sorry, could you say that again? Try ordering a drink or something to eat.") + tip;
}

export function ChatDemo() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "tutor", text: "Good morning! Welcome to the café. What can I get started for you today?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.parentElement?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMsgs((m) => [...m, { from: "you", text: clean }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const r = tutorReply(clean);
      setMsgs((m) => [...m, { from: "tutor", text: r }]);
      setTyping(false);
      speak(r.split(" (Tip")[0] ?? "");
    }, 700);
  };

  const mic = () => {
    const w = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setMsgs((m) => [...m, { from: "tutor", text: "Your browser doesn't support voice input — please type your answer instead." }]);
      return;
    }
    const rec = new SR();
    rec.lang = "en-GB";
    rec.onresult = (e: any) => send(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <>
      <div className="p-space-lg space-y-space-md bg-gradient-to-b from-luma-surface-container-lowest/40 to-luma-surface-container-low/40 h-[380px] overflow-y-auto">
        {msgs.map((m, i) =>
          m.from === "tutor" ? (
            <div key={i} className="flex items-start gap-space-sm max-w-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-luma-secondary-fixed to-luma-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-luma-secondary text-[22px]">smart_toy</span>
              </div>
              <div className="p-space-sm rounded-2xl rounded-tl-none bg-luma-surface-container-lowest shadow-[var(--luma-shadow-1)]">
                <div className="font-label-sm text-label-sm text-luma-primary font-bold mb-0.5">Tutor Claire</div>
                <p className="font-body-md text-body-md text-luma-on-surface">{m.text}</p>
                <Button variant="landing" size="landing" type="button" onClick={() => speak(m.text.split(" (Tip")[0] ?? "")} className="mt-1 flex items-center gap-1 text-luma-primary hover:underline">
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                  <span className="font-label-sm text-label-sm">Listen</span>
                </Button>
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start justify-end gap-space-sm ml-auto max-w-md">
              <div className="p-space-sm rounded-2xl rounded-tr-none bg-gradient-to-b from-luma-secondary-fixed to-luma-secondary-container text-luma-on-secondary-container">
                <div className="font-label-sm text-label-sm font-bold mb-0.5 text-right">You</div>
                <p className="font-body-md text-body-md font-medium">{m.text}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-luma-primary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-luma-primary text-[22px]">person</span>
              </div>
            </div>
          ),
        )}
        {typing && <div className="font-label-sm text-label-sm text-luma-on-surface-variant animate-pulse">Claire is typing…</div>}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-space-md bg-luma-surface-container-high/60 flex items-center justify-between gap-space-sm"
      >
        <div className="flex-grow flex items-center gap-space-sm px-space-md py-space-xs rounded-xl bg-luma-surface-container-lowest">
          <span className="material-symbols-outlined text-luma-primary text-[20px]">graphic_eq</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening…" : "Type your reply or press the microphone…"}
            className="w-full bg-transparent outline-none font-body-sm text-body-sm text-luma-on-surface"
          />
        </div>
        <Button variant="landing" size="landing" type="submit" aria-label="Send" className="w-12 h-12 rounded-full bg-luma-surface-container-lowest text-luma-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]">send</span>
        </Button>
        <Button variant="landing" size="landing" type="button" onClick={mic} aria-label="Speak" className={`w-12 h-12 rounded-full bg-gradient-to-b from-luma-primary-fixed to-luma-primary text-luma-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 ${listening ? "animate-pulse" : ""}`}>
          <span className="material-symbols-outlined text-[24px]">mic</span>
        </Button>
      </form>
    </>
  );
}

const WORDS = [
  { w: "Serendipity", p: "/ˌsɛr.ənˈdɪp.ə.ti/ • noun", d: "The occurrence and development of events by chance in a happy or beneficial way.", ex: ["Meeting my business partner on a train was pure serendipity.", "By serendipity, she found the book she'd been searching for."] },
  { w: "Resilient", p: "/rɪˈzɪl.i.ənt/ • adjective", d: "Able to recover quickly from difficulties.", ex: ["Children are often remarkably resilient.", "The team stayed resilient after losing the first match."] },
  { w: "Meticulous", p: "/məˈtɪk.jə.ləs/ • adjective", d: "Showing great attention to detail; very careful and precise.", ex: ["She keeps meticulous notes in every lesson.", "The report was meticulous and well researched."] },
];

export function FlashcardDemo() {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = WORDS[i] ?? WORDS[0];
  if (!c) return null;
  return (
    <div className="p-space-lg rounded-2xl bg-gradient-to-b from-luma-surface-container-lowest to-luma-surface-container-low shadow-[var(--luma-shadow-2)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-normal font-bold text-luma-primary">Word of the Day</span>
          <Button variant="landing" size="landing" type="button" onClick={() => { setI((i + 1) % WORDS.length); setFlipped(false); }} className="px-2 py-0.5 rounded-full bg-luma-surface-container-highest text-luma-on-surface font-label-sm text-label-sm hover:brightness-95">
            Next word →
          </Button>
        </div>
        <div className="p-space-md rounded-xl bg-gradient-to-br from-luma-surface-container-lowest to-luma-secondary-fixed/30 shadow-[var(--luma-shadow-3)] text-center my-space-sm min-h-[190px]">
          <div className="font-headline-md text-headline-md text-luma-on-surface font-bold">{c.w}</div>
          <div className="font-body-sm text-body-sm text-luma-on-surface-variant italic mt-0.5">{c.p}</div>
          {flipped ? (
            <ul className="font-body-sm text-body-sm text-luma-on-surface mt-space-sm space-y-1 text-left list-disc pl-4">
              {c.ex.map((e) => <li key={e}>{e}</li>)}
            </ul>
          ) : (
            <p className="font-body-sm text-body-sm text-luma-on-surface mt-space-sm">"{c.d}"</p>
          )}
          <div className="mt-space-sm flex justify-center gap-space-sm">
            <Button variant="landing" size="landing" type="button" onClick={() => speak(c.w, "en-GB")} className="inline-flex items-center gap-1 text-luma-primary hover:brightness-110">
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
              <span className="font-label-sm text-label-sm font-semibold">UK</span>
            </Button>
            <Button variant="landing" size="landing" type="button" onClick={() => speak(c.w, "en-US")} className="inline-flex items-center gap-1 text-luma-primary hover:brightness-110">
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
              <span className="font-label-sm text-label-sm font-semibold">US</span>
            </Button>
          </div>
        </div>
      </div>
      <Button variant="landing" size="landing" type="button" onClick={() => setFlipped((f) => !f)} className="w-full py-2 rounded-xl bg-luma-surface-container-high text-luma-on-surface font-label-lg text-label-lg hover:bg-luma-surface-container-highest transition-all flex items-center justify-center gap-1">
        <span className="material-symbols-outlined text-[18px]">cached</span>
        {flipped ? "Show Definition" : "Flip for Context Examples"}
      </Button>
    </div>
  );
}

const QUIZ = [
  { q: "By the time we arrived in London, the conference _______ already.", opts: ["has begun", "had begun", "was beginning"], a: 1, why: "Past Perfect shows an action completed before another past action." },
  { q: "If I _______ more time, I would travel the world.", opts: ["have", "had", "will have"], a: 1, why: "Second conditional uses the past simple in the if-clause." },
  { q: "She has lived in Madrid _______ 2019.", opts: ["for", "since", "from"], a: 1, why: "Use \"since\" with a starting point in time." },
];

export function QuizDemo() {
  const [n, setN] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const q = QUIZ[n] ?? QUIZ[0];
  if (!q) return null;
  const choose = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    if (i === q.a) setXp((x) => x + 50);
  };
  return (
    <div className="p-space-lg rounded-2xl bg-gradient-to-b from-luma-surface-container-lowest to-luma-surface-container-low shadow-[var(--luma-shadow-2)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-normal font-bold text-luma-tertiary">Quick Quiz {n + 1}/{QUIZ.length}</span>
          <span className="px-2 py-0.5 rounded-full bg-luma-tertiary-fixed text-luma-tertiary font-label-sm text-label-sm font-bold">{xp} XP</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-luma-on-surface mb-2">Select the correct answer:</h3>
        <p className="font-body-md text-body-md text-luma-on-surface-variant p-2 rounded-lg bg-luma-surface-container-low mb-space-sm">"{q.q}"</p>
        <div className="space-y-space-xs">
          {q.opts.map((o, i) => {
            const state = pick === null ? "" : i === q.a ? "bg-luma-tertiary-fixed/40" : i === pick ? "bg-luma-error-container" : "opacity-60";
            return (
              <Button variant="landing" size="landing" key={o} type="button" onClick={() => choose(i)} className={`w-full text-left flex items-center gap-space-xs p-2 rounded-xl bg-luma-surface-container-lowest shadow-[var(--luma-shadow-4)] hover:bg-luma-surface-container-high transition-all ${state}`}>
                <span className="font-body-sm text-body-sm text-luma-on-surface">{o}</span>
                {pick !== null && i === q.a && <span className="material-symbols-outlined text-luma-tertiary text-[18px] ml-auto">check_circle</span>}
                {pick === i && i !== q.a && <span className="material-symbols-outlined text-luma-error text-[18px] ml-auto">cancel</span>}
              </Button>
            );
          })}
        </div>
      </div>
      {pick !== null ? (
        <div className="mt-space-md space-y-2">
          <div className={`p-2 rounded-xl font-label-sm text-label-sm font-semibold ${pick === q.a ? "bg-luma-tertiary-fixed/40 text-luma-tertiary" : "bg-luma-error-container text-luma-on-error-container"}`}>
            {pick === q.a ? "Correct! " : "Not quite. "}{q.why}
          </div>
          <Button variant="landing" size="landing" type="button" onClick={() => { setN((n + 1) % QUIZ.length); setPick(null); }} className="w-full py-2 rounded-xl bg-luma-primary-container text-luma-on-primary font-label-lg text-label-lg">
            Next question
          </Button>
        </div>
      ) : (
        <div className="mt-space-md p-2 rounded-xl bg-luma-surface-container-high text-luma-on-surface-variant font-label-sm text-label-sm">Choose an option to check your answer.</div>
      )}
    </div>
  );
}

export function ClaimXpButton() {
  const [claimed, setClaimed] = useState(false);
  return (
    <Button variant="landing" size="landing" type="button" disabled={claimed} onClick={() => setClaimed(true)} className="mt-space-md w-full py-2 rounded-xl bg-gradient-to-b from-luma-primary-fixed to-luma-primary-container text-luma-on-primary font-label-lg text-label-lg shadow-[var(--luma-shadow-5)] disabled:opacity-80">
      {claimed ? "+350 XP claimed — see you next week" : "Claim Weekly XP Reward"}
    </Button>
  );
}
