import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatDemo, FlashcardDemo, QuizDemo, ClaimXpButton, PLATFORM_URL } from "@/components/landing-demos";
import background from "@/assets/luma-landing-background.jpg.asset.json";
import "@/styles/landing.css";

export default function Landing() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Source+Sans+3:wght@400;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
    document.head.appendChild(link);
    return () => { link.remove(); window.speechSynthesis?.cancel(); };
  }, []);
  return (
    <div className="luma-landing bg-luma-background font-body-md text-body-md text-luma-on-surface min-h-screen selection:bg-luma-secondary-fixed selection:text-luma-on-secondary-fixed">
<header className="fixed top-0 w-full z-50 px-gutter pt-space-sm"><div className="h-20 max-w-7xl mx-auto px-margin rounded-2xl bg-luma-surface/75 backdrop-blur-md shadow-[var(--luma-shadow-6)] flex items-center justify-between border-t border-luma-surface-container-lowest/80"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-luma-primary text-[32px]">school</span><span className="font-headline-sm text-headline-sm text-luma-primary tracking-normal">Ascend English</span></div><nav className="hidden xl:flex items-center gap-space-sm bg-luma-surface-container-lowest/60 p-space-xs rounded-xl" data-active-classes="bg-luma-primary-container text-luma-on-primary-container font-label-lg text-label-lg rounded-xl shadow-[var(--luma-shadow-7)]"><a aria-current="page" className="px-space-md py-space-xs transition-colors bg-luma-primary-container text-luma-on-primary-container font-label-lg text-label-lg rounded-xl shadow-[var(--luma-shadow-7)]" data-path="home" href="#top">Home</a><a className="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-luma-on-surface-variant hover:text-luma-on-surface transition-colors" data-path="features" href="#features">Features</a><a className="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-luma-on-surface-variant hover:text-luma-on-surface transition-colors" data-path="how-it-works" href="#how">How It Works</a><a className="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-luma-on-surface-variant hover:text-luma-on-surface transition-colors" data-path="learning-levels" href="#levels">Learning Levels</a><a className="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-luma-on-surface-variant hover:text-luma-on-surface transition-colors" data-path="ai-tutor" href="#tutor">AI Tutor</a><a className="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-luma-on-surface-variant hover:text-luma-on-surface transition-colors" data-path="faq" href="#faq">FAQ</a></nav><div className="flex items-center gap-space-sm"><Button variant="landing" size="landing" asChild><a className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs rounded-xl bg-luma-surface-container-low/80 text-luma-secondary font-label-lg text-label-lg shadow-[var(--luma-shadow-8)] hover:bg-luma-surface-container-high hover:text-luma-on-surface transition-all" data-path="login" href={PLATFORM_URL}>Log In</a></Button><Button variant="landing" size="landing" asChild><a className="relative overflow-hidden inline-flex items-center justify-center px-space-lg py-space-xs rounded-xl bg-luma-tertiary-container text-luma-on-tertiary font-label-lg text-label-lg shadow-[var(--luma-shadow-9)] hover:bg-luma-tertiary transition-all" data-path="get-started" href={PLATFORM_URL}><span className="relative z-10">Get Started</span><div className="absolute inset-x-0 top-0 h-1/2 bg-luma-surface-container-lowest/30 pointer-events-none rounded-t-xl"></div></a></Button><div className="w-8 h-8 rounded-full bg-luma-primary flex items-center justify-center shadow-[var(--luma-shadow-10)]"><span className="material-symbols-outlined text-luma-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-20 bg-luma-background"><div className="flex flex-col w-full relative overflow-hidden text-luma-on-surface">
{/* ========================================== */}
{/* HERO SECTION                               */}
{/* ========================================== */}
<section id="top" className="relative w-full -mt-20 pt-28 pb-space-xl overflow-hidden bg-cover bg-center" style={{backgroundImage: `url(${background.url})`}}>
{/* Atmospheric Aero Specular Gradient Overlay */}
<div className="absolute inset-0 bg-gradient-to-b from-luma-surface-bright/40 via-luma-surface/10 to-luma-surface/90 pointer-events-none"></div>
<div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-luma-secondary-fixed/40 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-luma-tertiary-fixed/30 blur-3xl pointer-events-none"></div>
<div className="max-w-7xl mx-auto px-margin relative z-10">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center pt-space-md pb-space-lg">
{/* Left Column: Value Prop & CTAs */}
<div className="lg:col-span-6 flex flex-col items-start gap-space-md">
{/* Translucent Pill Badge */}
<div className="relative overflow-hidden inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-11)]">
<span className="w-2.5 h-2.5 rounded-full bg-luma-tertiary-container shadow-[var(--luma-shadow-12)]"></span>
<span className="font-label-md text-label-md text-luma-primary tracking-normal uppercase font-semibold">✦ A smarter way to learn English</span>
{/* Top Sheen */}
<div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-luma-surface-container-lowest/70 to-transparent pointer-events-none"></div>
</div>
{/* Hero Headline */}
<h1 className="font-display-hero text-display-hero text-luma-on-surface ">
            Your journey to <span className="text-luma-primary underline decoration-luma-secondary-container decoration-wavy decoration-2">fluent English</span> starts here.
          </h1>
{/* Body Description */}
<p className="font-body-lg text-body-lg text-luma-on-surface-variant max-w-xl bg-luma-surface-container-lowest/50 backdrop-blur-sm p-space-sm rounded-xl">
            Learn English naturally with AI-powered conversations, personalized lessons, and interactive practice — from your first words to advanced fluency.
          </p>
{/* Buttons Group */}
<div className="flex flex-wrap items-center gap-space-md pt-space-xs">
{/* Glossy Aero Green Orb Button */}
<Button variant="landing" size="landing" asChild><a className="relative overflow-hidden group px-space-lg py-space-sm rounded-xl bg-gradient-to-b from-luma-tertiary-fixed to-luma-tertiary-container text-luma-on-tertiary font-headline-sm text-headline-sm shadow-[var(--luma-shadow-14)] hover:brightness-105 active:scale-95 transition-all" href={PLATFORM_URL}>
<span className="relative z-10 flex items-center gap-space-xs ">
                Start Learning Free
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</span>
{/* Curved Top Specular Reflection Highlight */}
<div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-luma-surface-container-lowest/80 via-luma-surface-container-lowest/30 to-transparent pointer-events-none rounded-t-xl"></div>
{/* Refraction glint */}
<div className="absolute top-1 left-3 w-3 h-1.5 rounded-full bg-luma-surface-container-lowest/90 blur-[0.5px]"></div>
</a></Button>
{/* Aero Glass Button */}
<a className="relative overflow-hidden group px-space-lg py-space-sm rounded-xl bg-luma-surface-container-lowest/70 backdrop-blur-md text-luma-secondary font-headline-sm text-headline-sm shadow-[var(--luma-shadow-16)] hover:bg-luma-surface-container-lowest/90 active:scale-95 transition-all" href="#features">
<span className="relative z-10 flex items-center gap-space-xs">
<span className="material-symbols-outlined text-luma-secondary text-[22px]">play_circle</span>
                Explore Features
              </span>
<div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-luma-surface-container-lowest/90 to-transparent pointer-events-none rounded-t-xl"></div>
</a>
</div>
{/* Trust Subtext */}
<div className="flex items-center gap-space-xs text-luma-on-surface-variant font-label-lg text-label-lg pt-space-xs">
<span className="flex items-center justify-center w-5 h-5 rounded-full bg-luma-tertiary-fixed shadow-[var(--luma-shadow-17)]">
<span className="material-symbols-outlined text-luma-tertiary-container text-[14px] font-bold">check</span>
</span>
<span>From beginner to advanced • Learn at your own pace • Free 14-day trial</span>
</div>
</div>
{/* Right Column: Windows Vista Aero Window Desk */}
<div className="lg:col-span-6 relative flex justify-center">
{/* Decorative Floating Liquid Glass Spheres */}
<div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-luma-surface-container-lowest/80 via-luma-secondary-container/30 to-transparent backdrop-blur-md shadow-[var(--luma-shadow-18)] pointer-events-none animate-bounce duration-[6000ms]">
<div className="absolute top-3 left-4 w-6 h-3 rounded-full bg-luma-surface-container-lowest/90 blur-[0.5px] rotate-[-20deg]"></div>
<div className="absolute bottom-3 right-4 w-4 h-2 rounded-full bg-luma-secondary-fixed/60 blur-[1px]"></div>
</div>
<div className="absolute -bottom-8 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-luma-surface-container-lowest/90 via-luma-tertiary-fixed/30 to-transparent backdrop-blur-md shadow-[var(--luma-shadow-19)] pointer-events-none animate-pulse">
<div className="absolute top-2 left-3 w-5 h-2.5 rounded-full bg-luma-surface-container-lowest/95 blur-[0.5px] rotate-[-15deg]"></div>
</div>
{/* Realistic Aero Glass Window */}
<div className="w-full max-w-lg rounded-2xl bg-luma-surface-container-lowest/85 backdrop-blur-xl shadow-[var(--luma-shadow-20)] overflow-hidden">
{/* Window Title Bar */}
<div className="relative bg-gradient-to-b from-luma-surface-container-highest/90 to-luma-surface-container-high/80 px-space-md py-space-xs flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-luma-primary text-[18px]">travel_explore</span>
<span className="font-label-md text-label-md text-luma-on-surface font-semibold tracking-normal">Ascend English Student OS - v2.6 [Active Studio]</span>
</div>
{/* Aero Window Control Dots */}
<div className="flex items-center gap-1.5">
<div className="w-3.5 h-3.5 rounded-full bg-luma-surface-variant shadow-[var(--luma-shadow-21)] flex items-center justify-center cursor-pointer hover:brightness-110">
<div className="w-1.5 h-0.5 bg-luma-outline"></div>
</div>
<div className="w-3.5 h-3.5 rounded-full bg-luma-secondary-fixed shadow-[var(--luma-shadow-21)] flex items-center justify-center cursor-pointer hover:brightness-110">
<div className="w-1.5 h-1.5 rounded-[1px] bg-luma-secondary"></div>
</div>
<div className="w-3.5 h-3.5 rounded-full bg-luma-error-container shadow-[var(--luma-shadow-21)] flex items-center justify-center cursor-pointer hover:brightness-110">
<div className="w-1.5 h-0.5 bg-luma-error rotate-45 transform"></div>
</div>
</div>
<div className="absolute inset-x-0 top-0 h-1/2 bg-luma-surface-container-lowest/60 pointer-events-none"></div>
</div>
{/* Window Content Deck */}
<div className="p-space-md space-y-space-md bg-gradient-to-b from-luma-surface-container-lowest/60 to-luma-surface/80">
{/* User Status Strip */}
<div className="flex items-center justify-between p-space-sm rounded-xl bg-luma-surface-container-low shadow-[var(--luma-shadow-22)]">
<div className="flex items-center gap-space-sm">
<div className="relative w-12 h-12 rounded-full overflow-hidden bg-luma-primary-fixed flex items-center justify-center shadow-[var(--luma-shadow-23)]">
<span className="material-symbols-outlined text-luma-primary text-[28px]">face</span>
<div className="absolute top-0.5 left-1 w-4 h-2 rounded-full bg-luma-surface-container-lowest/80 blur-[0.5px]"></div>
</div>
<div>
<div className="font-headline-sm text-headline-sm text-luma-on-surface font-semibold">Sophia Chen</div>
<div className="flex items-center gap-1 font-label-sm text-label-sm text-luma-primary">
<span className="w-2 h-2 rounded-full bg-luma-tertiary-container shadow-[var(--luma-shadow-24)]"></span>
                      Level: B1 Intermediate Track
                    </div>
</div>
</div>
{/* Daily Streak Badge */}
<div className="flex items-center gap-1.5 px-space-sm py-1 rounded-xl bg-gradient-to-b from-luma-secondary-fixed to-luma-secondary-container text-luma-on-secondary-container shadow-[var(--luma-shadow-25)]">
<span className="material-symbols-outlined text-[18px]">local_fire_department</span>
<span className="font-label-lg text-label-lg font-bold">14 Days Streak</span>
</div>
</div>
{/* Main Interactive Pod: Circular Progress + Next Lesson */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
{/* Gauge Card */}
<div className="p-space-sm rounded-xl bg-luma-surface-container-lowest/90 shadow-[var(--luma-shadow-26)] flex flex-col items-center justify-center text-center">
<span className="font-label-md text-label-md text-luma-on-surface-variant font-medium">B1 Milestone Progress</span>
{/* SVG Circular Liquid Gauge */}
<div className="relative w-24 h-24 my-2 flex items-center justify-center">
<svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
<circle className="text-luma-surface-container-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
<circle className="text-luma-primary-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="70.3" strokeLinecap="round" strokeWidth="8" />
</svg>
<div className="absolute flex flex-col items-center justify-center">
<span className="font-headline-md text-headline-md text-luma-primary font-bold">72%</span>
<span className="font-label-sm text-label-sm text-luma-on-surface-variant">Proficient</span>
</div>
</div>
<span className="font-body-sm text-body-sm text-luma-tertiary font-semibold">18 / 25 Lessons Done</span>
</div>
{/* Recommended Lesson Pod */}
<div className="p-space-sm rounded-xl bg-luma-surface-container-lowest/90 shadow-[var(--luma-shadow-26)] flex flex-col justify-between">
<div>
<div className="inline-flex px-2 py-0.5 rounded-md bg-luma-secondary-fixed text-luma-on-secondary-fixed font-label-sm text-label-sm font-semibold mb-1">
                      Ready to Resume
                    </div>
<div className="font-headline-sm text-headline-sm text-luma-on-surface line-clamp-1">Ordering at a London Bistro</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mt-1 line-clamp-2">Practice polite modals: Could you, Would you like, and May I.</p>
</div>
<a href={PLATFORM_URL} className="mt-2 w-full py-1.5 rounded-lg bg-luma-primary-container text-luma-on-primary font-label-lg text-label-lg flex items-center justify-center gap-1 shadow-[var(--luma-shadow-27)] hover:brightness-105">
<span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    Resume Lesson
                  </a>
</div>
</div>
{/* Audio Waveform AI Conversation Preview Strip */}
<div className="p-space-sm rounded-xl bg-luma-surface-container-low shadow-[var(--luma-shadow-28)]">
<div className="flex items-center justify-between mb-1.5">
<div className="flex items-center gap-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-luma-secondary-container animate-ping"></span>
<span className="font-label-md text-label-md text-luma-on-surface font-semibold">Live Vocal Waveform Coach</span>
</div>
<span className="font-label-sm text-label-sm text-luma-primary font-bold">Accuracy: 96%</span>
</div>
{/* Graphic Audio Bars */}
<div className="h-8 flex items-center justify-between gap-1 px-2 rounded-lg bg-luma-surface-container-lowest/90">
<div className="w-1.5 h-3 bg-luma-secondary-container rounded-full"></div>
<div className="w-1.5 h-6 bg-luma-primary-container rounded-full"></div>
<div className="w-1.5 h-4 bg-luma-tertiary-container rounded-full"></div>
<div className="w-1.5 h-7 bg-luma-primary-container rounded-full"></div>
<div className="w-1.5 h-5 bg-luma-secondary-container rounded-full"></div>
<div className="w-1.5 h-8 bg-luma-tertiary-container rounded-full"></div>
<div className="w-1.5 h-3 bg-luma-primary-container rounded-full"></div>
<div className="w-1.5 h-6 bg-luma-secondary-container rounded-full"></div>
<div className="w-1.5 h-4 bg-luma-tertiary-container rounded-full"></div>
<div className="w-1.5 h-7 bg-luma-primary-container rounded-full"></div>
<div className="w-1.5 h-3 bg-luma-secondary-container rounded-full"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* ========================================== */}
{/* 2. FEATURES SECTION                        */}
{/* ========================================== */}
<section id="features" className="w-full py-space-xl px-margin max-w-7xl mx-auto">
<div className="text-center max-w-3xl mx-auto mb-space-lg">
<div className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-luma-secondary-fixed/50 text-luma-secondary font-label-md text-label-md uppercase font-bold tracking-normal mb-space-xs">
<span className="material-symbols-outlined text-[16px]">stars</span>
        Complete English Engine
      </div>
<h2 className="font-headline-lg text-headline-lg text-luma-on-surface">Everything you need to master English.</h2>
<p className="font-body-lg text-body-lg text-luma-on-surface-variant mt-2">
        A multisensory ecosystem engineered with communicative fluidity, skeuomorphic precision, and real-time acoustic feedback.
      </p>
</div>
{/* 6-Card Aero Glass Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
{/* Feature 1: AI Tutor */}
<div className="group relative rounded-2xl p-space-lg bg-gradient-to-b from-luma-surface-container-lowest/90 to-luma-surface-container-low/70 backdrop-blur-md shadow-[var(--luma-shadow-29)] hover:shadow-[var(--luma-shadow-30)] hover:-translate-y-1 transition-all duration-300">
{/* Top spec gloss highlight */}
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-luma-surface-container-lowest/80 to-transparent pointer-events-none rounded-t-2xl"></div>
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luma-secondary-fixed to-luma-secondary-container flex items-center justify-center shadow-[var(--luma-shadow-31)] mb-space-md">
<span className="material-symbols-outlined text-luma-on-secondary-container text-[30px]">forum</span>
</div>
<h3 className="font-headline-md text-headline-md text-luma-on-surface mb-space-xs">AI Conversation Tutor</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant">
          Practice realistic spoken conversations with an AI tutor that adapts vocabulary, tempo, and grammatical nuance dynamically to your fluency level.
        </p>
<div className="mt-space-md flex items-center gap-1 font-label-lg text-label-lg text-luma-primary font-semibold group-hover:gap-2 transition-all">
<span>Explore vocal modes</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</div>
</div>
{/* Feature 2: Grammar */}
<div className="group relative rounded-2xl p-space-lg bg-gradient-to-b from-luma-surface-container-lowest/90 to-luma-surface-container-low/70 backdrop-blur-md shadow-[var(--luma-shadow-29)] hover:shadow-[var(--luma-shadow-30)] hover:-translate-y-1 transition-all duration-300">
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-luma-surface-container-lowest/80 to-transparent pointer-events-none rounded-t-2xl"></div>
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luma-tertiary-fixed to-luma-tertiary-fixed-dim flex items-center justify-center shadow-[var(--luma-shadow-32)] mb-space-md">
<span className="material-symbols-outlined text-luma-tertiary text-[30px]">auto_stories</span>
</div>
<h3 className="font-headline-md text-headline-md text-luma-on-surface mb-space-xs">Grammar Made Simple</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant">
          Understand intricate syntax rules through illuminated mental models, visual sentence dissecting tools, and interactive skeuomorphic puzzles.
        </p>
<div className="mt-space-md flex items-center gap-1 font-label-lg text-label-lg text-luma-tertiary font-semibold group-hover:gap-2 transition-all">
<span>View syntax visualizer</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</div>
</div>
{/* Feature 3: Listening & Pronunciation */}
<div className="group relative rounded-2xl p-space-lg bg-gradient-to-b from-luma-surface-container-lowest/90 to-luma-surface-container-low/70 backdrop-blur-md shadow-[var(--luma-shadow-29)] hover:shadow-[var(--luma-shadow-30)] hover:-translate-y-1 transition-all duration-300">
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-luma-surface-container-lowest/80 to-transparent pointer-events-none rounded-t-2xl"></div>
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luma-primary-fixed to-luma-primary-fixed-dim flex items-center justify-center shadow-[var(--luma-shadow-33)] mb-space-md">
<span className="material-symbols-outlined text-luma-primary text-[30px]">headphones</span>
</div>
<h3 className="font-headline-md text-headline-md text-luma-on-surface mb-space-xs">Listening &amp; Pronunciation</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant">
          Train comprehension with authentic global English accents, followed by millisecond phoneme analysis to correct inflection and phonetics.
        </p>
<div className="mt-space-md flex items-center gap-1 font-label-lg text-label-lg text-luma-primary font-semibold group-hover:gap-2 transition-all">
<span>Test audio lab</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</div>
</div>
{/* Feature 4: Reading & Vocabulary */}
<div className="group relative rounded-2xl p-space-lg bg-gradient-to-b from-luma-surface-container-lowest/90 to-luma-surface-container-low/70 backdrop-blur-md shadow-[var(--luma-shadow-29)] hover:shadow-[var(--luma-shadow-30)] hover:-translate-y-1 transition-all duration-300">
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-luma-surface-container-lowest/80 to-transparent pointer-events-none rounded-t-2xl"></div>
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luma-secondary-fixed to-luma-primary-fixed flex items-center justify-center shadow-[var(--luma-shadow-31)] mb-space-md">
<span className="material-symbols-outlined text-luma-secondary text-[30px]">menu_book</span>
</div>
<h3 className="font-headline-md text-headline-md text-luma-on-surface mb-space-xs">Reading &amp; Vocabulary</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant">
          Expand lexicon through contextual immersion: curated literary excerpts, contemporary tech news, and glass flashcards with spaced repetition.
        </p>
<div className="mt-space-md flex items-center gap-1 font-label-lg text-label-lg text-luma-primary font-semibold group-hover:gap-2 transition-all">
<span>Inspect library</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</div>
</div>
{/* Feature 5: Writing Practice */}
<div className="group relative rounded-2xl p-space-lg bg-gradient-to-b from-luma-surface-container-lowest/90 to-luma-surface-container-low/70 backdrop-blur-md shadow-[var(--luma-shadow-29)] hover:shadow-[var(--luma-shadow-30)] hover:-translate-y-1 transition-all duration-300">
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-luma-surface-container-lowest/80 to-transparent pointer-events-none rounded-t-2xl"></div>
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luma-surface-container-high to-luma-surface-container-highest flex items-center justify-center shadow-[var(--luma-shadow-34)] mb-space-md">
<span className="material-symbols-outlined text-luma-on-surface text-[30px]">edit_note</span>
</div>
<h3 className="font-headline-md text-headline-md text-luma-on-surface mb-space-xs">Writing Practice</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant">
          Master composition ranging from executive emails to university essays with instant stylistic scoring and tone rephrasing suggestions.
        </p>
<div className="mt-space-md flex items-center gap-1 font-label-lg text-label-lg text-luma-primary font-semibold group-hover:gap-2 transition-all">
<span>Try writing editor</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</div>
</div>
{/* Feature 6: Personalized Learning */}
<div className="group relative rounded-2xl p-space-lg bg-gradient-to-b from-luma-surface-container-lowest/90 to-luma-surface-container-low/70 backdrop-blur-md shadow-[var(--luma-shadow-29)] hover:shadow-[var(--luma-shadow-30)] hover:-translate-y-1 transition-all duration-300">
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-luma-surface-container-lowest/80 to-transparent pointer-events-none rounded-t-2xl"></div>
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luma-tertiary-fixed to-luma-secondary-fixed flex items-center justify-center shadow-[var(--luma-shadow-35)] mb-space-md">
<span className="material-symbols-outlined text-luma-tertiary text-[30px]">insights</span>
</div>
<h3 className="font-headline-md text-headline-md text-luma-on-surface mb-space-xs">Personalized Learning</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant">
          Adaptive cognitive mapping tracks neural retention curves, tailoring daily exercises precisely to eliminate lingering pronunciation and grammatical snags.
        </p>
<div className="mt-space-md flex items-center gap-1 font-label-lg text-label-lg text-luma-tertiary font-semibold group-hover:gap-2 transition-all">
<span>See adaptive path</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</div>
</div>
</div>
</section>
{/* ========================================== */}
{/* 3. HOW IT WORKS SECTION                    */}
{/* ========================================== */}
<section id="how" className="w-full py-space-xl bg-gradient-to-b from-luma-surface-container-low/60 via-luma-surface to-luma-surface-container-low/60 relative overflow-hidden">
<div className="max-w-7xl mx-auto px-margin relative z-10">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="px-space-md py-space-xs rounded-full bg-luma-primary-fixed text-luma-primary font-label-md text-label-md uppercase font-bold tracking-normal inline-block mb-space-xs">
          Streamlined Progression
        </span>
<h2 className="font-headline-lg text-headline-lg text-luma-on-surface">Your path to better English, made simple.</h2>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-1">Three crystal-clear steps from initial baseline assessment to confident conversational autonomy.</p>
</div>
{/* 3-Step Curved Connector Layout */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative">
{/* Step 1 */}
<div className="relative flex flex-col p-space-lg rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-36)]">
<div className="flex items-center justify-between mb-space-md">
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luma-secondary-fixed to-luma-primary-container text-luma-on-primary-container font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-37)]">
              01
            </div>
<span className="material-symbols-outlined text-luma-primary text-[28px]">assignment_turned_in</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface mb-space-xs">Discover your level</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant flex-grow">
            Start with our 8-minute adaptive English placement benchmark to evaluate listening, grammar depth, and conversational fluency across CEFR bands.
          </p>
<div className="mt-space-md p-space-sm rounded-xl bg-luma-surface-container-low flex items-center justify-between">
<span className="font-label-sm text-label-sm text-luma-on-surface-variant font-semibold">CEFR Diagnostic</span>
<span className="font-label-sm text-label-sm text-luma-tertiary font-bold">100% Free &amp; Calibrated</span>
</div>
</div>
{/* Step 2 */}
<div className="relative flex flex-col p-space-lg rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-36)]">
<div className="flex items-center justify-between mb-space-md">
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luma-tertiary-fixed to-luma-tertiary-container text-luma-on-tertiary font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-38)]">
              02
            </div>
<span className="material-symbols-outlined text-luma-tertiary text-[28px]">route</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface mb-space-xs">Follow your journey</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant flex-grow">
            Explore 15-minute bite-sized thematic chapters: authentic London situational roleplays, Silicon Valley business discussions, and everyday idioms.
          </p>
<div className="mt-space-md p-space-sm rounded-xl bg-luma-surface-container-low flex items-center justify-between">
<span className="font-label-sm text-label-sm text-luma-on-surface-variant font-semibold">Structured Pathways</span>
<span className="font-label-sm text-label-sm text-luma-primary font-bold">350+ Scenarios</span>
</div>
</div>
{/* Step 3 */}
<div className="relative flex flex-col p-space-lg rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-36)]">
<div className="flex items-center justify-between mb-space-md">
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luma-primary-fixed to-luma-primary text-luma-on-primary font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-39)]">
              03
            </div>
<span className="material-symbols-outlined text-luma-secondary text-[28px]">voice_chat</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface mb-space-xs">Practice and improve</h3>
<p className="font-body-md text-body-md text-luma-on-surface-variant flex-grow">
            Engage in unscripted real-time voice sessions with your personalized AI tutor Claire, receiving instantaneous pronunciation analysis and lexical polish.
          </p>
<div className="mt-space-md p-space-sm rounded-xl bg-luma-surface-container-low flex items-center justify-between">
<span className="font-label-sm text-label-sm text-luma-on-surface-variant font-semibold">Vocal Mastery</span>
<span className="font-label-sm text-label-sm text-luma-tertiary font-bold">Real-Time Acoustic AI</span>
</div>
</div>
</div>
</div>
</section>
{/* ========================================== */}
{/* 4. LEARNING LEVELS (CEFR PROGRESSION)      */}
{/* ========================================== */}
<section id="levels" className="w-full py-space-xl px-margin max-w-7xl mx-auto">
<div className="text-center max-w-3xl mx-auto mb-space-xl">
<div className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-luma-secondary-fixed/50 text-luma-secondary font-label-md text-label-md uppercase font-bold tracking-normal mb-space-xs">
<span className="material-symbols-outlined text-[16px]">stairs</span>
        Global Standard (CEFR)
      </div>
<h2 className="font-headline-lg text-headline-lg text-luma-on-surface">From your first hello to confident fluency.</h2>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-1">
        Calibrated against the Common European Framework of Reference. Every level unlocks higher linguistic agility.
      </p>
</div>
{/* Ascending Glass Staircase / Progression Deck */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
{/* A1 Beginner */}
<div className="p-space-md rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-40)] hover:shadow-[var(--luma-shadow-41)] transition-all">
<div className="flex items-center gap-space-sm mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-luma-secondary-fixed text-luma-on-secondary-fixed font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-42)]">
            A1
          </div>
<div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface">Beginner</h3>
<span className="font-label-sm text-label-sm text-luma-secondary font-semibold">Foundational Immersion</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">
          First steps, essential greetings, numbers, and basic survival phrases for immediate day-to-day encounters.
        </p>
<div className="w-full bg-luma-surface-container-high rounded-full h-2 overflow-hidden">
<div className="bg-luma-secondary-container h-2 rounded-full w-full"></div>
</div>
</div>
{/* A2 Elementary */}
<div className="p-space-md rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-40)] hover:shadow-[var(--luma-shadow-41)] transition-all">
<div className="flex items-center gap-space-sm mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-luma-secondary-container text-luma-on-secondary-container font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-42)]">
            A2
          </div>
<div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface">Elementary</h3>
<span className="font-label-sm text-label-sm text-luma-secondary font-semibold">Social Mechanics</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">
          Daily routines, shopping queries, food ordering, and straightforward descriptive exchanges about family and home.
        </p>
<div className="w-full bg-luma-surface-container-high rounded-full h-2 overflow-hidden">
<div className="bg-luma-secondary-container h-2 rounded-full w-full"></div>
</div>
</div>
{/* B1 Intermediate */}
<div className="p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-43)] hover:shadow-[var(--luma-shadow-44)] transition-all relative">
<div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-label-sm text-label-sm font-bold shadow-[var(--luma-shadow-45)]">
          Most Popular
        </div>
<div className="flex items-center gap-space-sm mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luma-tertiary-fixed to-luma-tertiary-container text-luma-on-tertiary font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-42)]">
            B1
          </div>
<div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface">Intermediate</h3>
<span className="font-label-sm text-label-sm text-luma-tertiary font-semibold">Conversational Freedom</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">
          Travel conversations, expressing opinions, describing dreams and ambitions, and handling everyday work discussions.
        </p>
<div className="w-full bg-luma-surface-container-high rounded-full h-2 overflow-hidden">
<div className="bg-luma-tertiary-container h-2 rounded-full w-3/4"></div>
</div>
</div>
{/* B2 Upper Intermediate */}
<div className="p-space-md rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-40)] hover:shadow-[var(--luma-shadow-41)] transition-all">
<div className="flex items-center gap-space-sm mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-luma-primary-fixed text-luma-on-primary-fixed font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-42)]">
            B2
          </div>
<div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface">Upper Intermediate</h3>
<span className="font-label-sm text-label-sm text-luma-primary font-semibold">Professional Nuance</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">
          Spontaneous debate, technical and abstract texts, business negotiations, and fluent interpersonal discourse.
        </p>
<div className="w-full bg-luma-surface-container-high rounded-full h-2 overflow-hidden">
<div className="bg-luma-primary-container h-2 rounded-full w-1/2"></div>
</div>
</div>
{/* C1 Advanced */}
<div className="p-space-md rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-40)] hover:shadow-[var(--luma-shadow-41)] transition-all">
<div className="flex items-center gap-space-sm mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-luma-primary-container text-luma-on-primary font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-42)]">
            C1
          </div>
<div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface">Advanced</h3>
<span className="font-label-sm text-label-sm text-luma-primary font-semibold">Idiomatic Mastery</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">
          Effortless articulation, subtle humor, cultural references, sophisticated prose, and academic eloquence.
        </p>
<div className="w-full bg-luma-surface-container-high rounded-full h-2 overflow-hidden">
<div className="bg-luma-primary h-2 rounded-full w-1/3"></div>
</div>
</div>
{/* C2 Proficiency */}
<div className="p-space-md rounded-2xl bg-luma-surface-container-lowest/80 backdrop-blur-md shadow-[var(--luma-shadow-40)] hover:shadow-[var(--luma-shadow-41)] transition-all">
<div className="flex items-center gap-space-sm mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luma-primary to-luma-inverse-surface text-luma-on-primary font-headline-md text-headline-md font-bold flex items-center justify-center shadow-[var(--luma-shadow-42)]">
            C2
          </div>
<div>
<h3 className="font-headline-sm text-headline-sm text-luma-on-surface">Proficiency</h3>
<span className="font-label-sm text-label-sm text-luma-primary font-semibold">Native Resonance</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">
          Native-level ease, literary command, nuanced debate, and complete spontaneous bilingual cognitive switching.
        </p>
<div className="w-full bg-luma-surface-container-high rounded-full h-2 overflow-hidden">
<div className="bg-luma-inverse-surface h-2 rounded-full w-1/4"></div>
</div>
</div>
</div>
</section>
{/* ========================================== */}
{/* 5. MEET YOUR AI ENGLISH TUTOR              */}
{/* ========================================== */}
<section id="tutor" className="w-full py-space-xl bg-gradient-to-b from-luma-surface via-luma-surface-container-high/40 to-luma-surface relative overflow-hidden">
<div className="max-w-7xl mx-auto px-margin relative z-10">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
{/* Text intro */}
<div className="lg:col-span-5 flex flex-col gap-space-sm">
<div className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-luma-tertiary-fixed text-luma-tertiary font-label-md text-label-md uppercase font-bold tracking-normal w-fit">
<span className="material-symbols-outlined text-[16px]">record_voice_over</span>
            Aero Vocal Intelligence
          </div>
<h2 className="font-headline-lg text-headline-lg text-luma-on-surface">Practice real conversations. Build real confidence.</h2>
<p className="font-body-lg text-body-lg text-luma-on-surface-variant">
            Meet Claire, your London-accented AI conversation partner. She listens patiently, offers natural conversational rejoinders, and breaks down your pronunciation flaws without judgment.
          </p>
<div className="space-y-space-xs mt-space-sm">
<div className="flex items-center gap-space-xs text-luma-on-surface">
<span className="material-symbols-outlined text-luma-tertiary text-[20px]">check_circle</span>
<span className="font-body-md text-body-md">Adaptive tempo — speaks slower when you hesitate</span>
</div>
<div className="flex items-center gap-space-xs text-luma-on-surface">
<span className="material-symbols-outlined text-luma-tertiary text-[20px]">check_circle</span>
<span className="font-body-md text-body-md">Live phonetic feedback on British &amp; American vowels</span>
</div>
<div className="flex items-center gap-space-xs text-luma-on-surface">
<span className="material-symbols-outlined text-luma-tertiary text-[20px]">check_circle</span>
<span className="font-body-md text-body-md">Zero stage fright: infinite conversational retries</span>
</div>
</div>
<div className="pt-space-md">
<Button variant="landing" size="landing" asChild><a className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-luma-primary-container text-luma-on-primary font-headline-sm text-headline-sm shadow-[var(--luma-shadow-46)] hover:brightness-105 transition-all" href={PLATFORM_URL}>
<span className="material-symbols-outlined text-[22px]">mic</span>
              Discover AI Conversations
            </a></Button>
</div>
</div>
{/* Chat Simulator Glass Window */}
<div className="lg:col-span-7">
<div className="rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-xl shadow-[var(--luma-shadow-47)] overflow-hidden">
{/* Window header */}
<div className="bg-gradient-to-r from-luma-surface-container-highest via-luma-surface-container-high to-luma-surface-container-highest px-space-md py-space-xs flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<div className="w-3 h-3 rounded-full bg-luma-tertiary shadow-[var(--luma-shadow-48)]"></div>
<span className="font-label-md text-label-md text-luma-on-surface font-bold">Claire AI Tutor • Scenario: "Covent Garden Café"</span>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded-full bg-luma-secondary-fixed text-luma-on-secondary-fixed font-label-sm text-label-sm font-semibold">RP British Accent</span>
</div>
</div>
<ChatDemo />
</div>
</div>
</div>
</div>
</section>
{/* ========================================== */}
{/* 6. INTERACTIVE LEARNING EXPERIENCE         */}
{/* ========================================== */}
<section id="practice" className="w-full py-space-xl px-margin max-w-7xl mx-auto">
<div className="text-center max-w-3xl mx-auto mb-space-lg">
<div className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-luma-tertiary-fixed text-luma-tertiary font-label-md text-label-md uppercase font-bold tracking-normal mb-space-xs">
<span className="material-symbols-outlined text-[16px]">touch_app</span>
        Sensory Gamification
      </div>
<h2 className="font-headline-lg text-headline-lg text-luma-on-surface">Learning English should feel rewarding.</h2>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-1">
        Interact directly with our signature learning modules: flip 3D vocab cards, solve live grammar checks, and unlock weekly medals.
      </p>
</div>
{/* UI Component Showcase Mosaic */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
<FlashcardDemo />
<QuizDemo />
{/* Component 3: Streak & Trophy Showcase */}
<div className="p-space-lg rounded-2xl bg-gradient-to-b from-luma-surface-container-lowest to-luma-surface-container-low backdrop-blur-md shadow-[var(--luma-shadow-2)] flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="font-label-sm text-label-sm uppercase tracking-normal font-bold text-luma-primary">Student Showcase</span>
<span className="material-symbols-outlined text-luma-secondary-container text-[20px]">military_tech</span>
</div>
<div className="flex flex-col items-center text-center my-space-sm">
{/* Glossy Sun Medal */}
<div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-luma-secondary-fixed via-luma-tertiary-fixed to-luma-secondary-container flex items-center justify-center shadow-[var(--luma-shadow-49)] mb-space-xs">
<span className="material-symbols-outlined text-luma-on-surface text-[40px]">emoji_events</span>
<div className="absolute top-1 left-2.5 w-6 h-3 rounded-full bg-luma-surface-container-lowest/80 blur-[0.5px]"></div>
</div>
<div className="font-headline-sm text-headline-sm text-luma-on-surface font-bold">14-Day Streak Master</div>
<p className="font-body-sm text-body-sm text-luma-on-surface-variant">Top 5% consistency across global learners this week.</p>
</div>
{/* Day Dots Tracker */}
<div className="flex justify-between items-center px-space-xs py-2 bg-luma-surface-container-lowest rounded-xl shadow-[var(--luma-shadow-50)]">
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">M</span><div className="w-5 h-5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-bold text-[10px] flex items-center justify-center">✓</div></div>
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">T</span><div className="w-5 h-5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-bold text-[10px] flex items-center justify-center">✓</div></div>
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">W</span><div className="w-5 h-5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-bold text-[10px] flex items-center justify-center">✓</div></div>
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">T</span><div className="w-5 h-5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-bold text-[10px] flex items-center justify-center">✓</div></div>
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">F</span><div className="w-5 h-5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-bold text-[10px] flex items-center justify-center">✓</div></div>
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">S</span><div className="w-5 h-5 rounded-full bg-luma-tertiary-container text-luma-on-tertiary font-bold text-[10px] flex items-center justify-center">✓</div></div>
<div className="flex flex-col items-center"><span className="font-label-sm text-label-sm text-luma-on-surface-variant">S</span><div className="w-5 h-5 rounded-full bg-luma-secondary-fixed text-luma-on-secondary-fixed font-bold text-[10px] flex items-center justify-center">★</div></div>
</div>
</div>
<ClaimXpButton />
</div>
</div>
</section>
{/* ========================================== */}
{/* 7. FAQ SECTION                             */}
{/* ========================================== */}
<section id="faq" className="w-full py-space-xl bg-luma-surface-container-low/50 relative">
<div className="max-w-4xl mx-auto px-margin relative z-10">
<div className="text-center mb-space-xl">
<span className="px-space-md py-space-xs rounded-full bg-luma-primary-fixed text-luma-primary font-label-md text-label-md uppercase font-bold tracking-normal inline-block mb-space-xs">
          Clear Answers
        </span>
<h2 className="font-headline-lg text-headline-lg text-luma-on-surface">Frequently Asked Questions</h2>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-1">Everything you need to know about the Ascend English learning platform.</p>
</div>
{/* Glass Accordion List */}
<div className="space-y-space-sm" id="faq-accordion">
{/* FAQ 1 */}
<details className="group p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-40)] cursor-pointer" open>
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-luma-on-surface list-none">
<span>What is Ascend English?</span>
<span className="material-symbols-outlined text-luma-primary group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-space-sm pt-space-xs border-t border-luma-surface-container-high/60">
            Ascend English is an intelligent linguistic platform combining natural immersion, CEFR curriculum frameworks, and real-time AI conversation tutors. It bridges the gap between passive memorization and fluent spontaneous speech.
          </p>
</details>
{/* FAQ 2 */}
<details className="group p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-40)] cursor-pointer">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-luma-on-surface list-none">
<span>Is Ascend English suitable for beginners?</span>
<span className="material-symbols-outlined text-luma-primary group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-space-sm pt-space-xs border-t border-luma-surface-container-high/60">
            Yes! Our A1 Beginner module starts with basic greetings, phonetic pronunciation primers, and everyday visual vocabulary with optional native-language interface guidance.
          </p>
</details>
{/* FAQ 3 */}
<details className="group p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-40)] cursor-pointer">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-luma-on-surface list-none">
<span>What English levels are available?</span>
<span className="material-symbols-outlined text-luma-primary group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-space-sm pt-space-xs border-t border-luma-surface-container-high/60">
            Ascend covers all six CEFR levels: A1 (Beginner), A2 (Elementary), B1 (Intermediate), B2 (Upper Intermediate), C1 (Advanced), and C2 (Proficiency), with dedicated business and academic tracks.
          </p>
</details>
{/* FAQ 4 */}
<details className="group p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-40)] cursor-pointer">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-luma-on-surface list-none">
<span>How does the AI conversation tutor work?</span>
<span className="material-symbols-outlined text-luma-primary group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-space-sm pt-space-xs border-t border-luma-surface-container-high/60">
            Our Aero Vocal Engine processes your spoken voice in real time, responds naturally using realistic British or American intonation, and offers instant micro-corrections for syntax, stress, and pronunciation.
          </p>
</details>
{/* FAQ 5 */}
<details className="group p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-40)] cursor-pointer">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-luma-on-surface list-none">
<span>Can I learn on my phone?</span>
<span className="material-symbols-outlined text-luma-primary group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-space-sm pt-space-xs border-t border-luma-surface-container-high/60">
            Absolutely. Ascend is fully responsive on iOS, Android, and web browsers, syncing your daily streak, flashcard decks, and voice roleplays seamlessly across devices.
          </p>
</details>
{/* FAQ 6 */}
<details className="group p-space-md rounded-2xl bg-luma-surface-container-lowest/90 backdrop-blur-md shadow-[var(--luma-shadow-40)] cursor-pointer">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-luma-on-surface list-none">
<span>How is my learning progress tracked?</span>
<span className="material-symbols-outlined text-luma-primary group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-md text-body-md text-luma-on-surface-variant mt-space-sm pt-space-xs border-t border-luma-surface-container-high/60">
            Your personal Aero Dashboard tracks CEFR milestone completion percentages, active vocabulary retention counts, daily consistency streaks, and pronunciation accuracy trends.
          </p>
</details>
</div>
</div>
</section>
{/* ========================================== */}
{/* 8. FINAL CALL TO ACTION                    */}
{/* ========================================== */}
<section className="relative w-full py-space-xl overflow-hidden bg-cover bg-center" style={{backgroundImage: `url(${background.url})`}}>
{/* Atmospheric Aero Glass Overlays */}
<div className="absolute inset-0 bg-gradient-to-t from-luma-surface via-luma-surface-bright/50 to-luma-surface-bright/20 pointer-events-none"></div>
<div className="max-w-5xl mx-auto px-margin relative z-10 text-center">
{/* Big Translucent Glass Pod Card */}
<div className="p-space-xl rounded-3xl bg-luma-surface-container-lowest/80 backdrop-blur-xl shadow-[var(--luma-shadow-51)] flex flex-col items-center">
{/* Floating Glass Orb Icon */}
<div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-luma-secondary-fixed via-luma-tertiary-fixed to-luma-primary-fixed flex items-center justify-center shadow-[var(--luma-shadow-52)] mb-space-md">
<span className="material-symbols-outlined text-luma-primary text-[42px]">language</span>
<div className="absolute top-1.5 left-2.5 w-6 h-3 rounded-full bg-luma-surface-container-lowest/90 blur-[0.5px]"></div>
</div>
<h2 className="font-display-hero text-display-hero text-luma-on-surface max-w-2xl">
          A world of opportunities starts with English.
        </h2>
<p className="font-body-lg text-body-lg text-luma-on-surface-variant max-w-xl mt-space-sm">
          Take the next step toward your goals with a learning experience built around you. Start speaking with clarity, confidence, and effortless poise.
        </p>
{/* CTA Buttons */}
<div className="flex flex-wrap items-center justify-center gap-space-md mt-space-lg">
{/* Primary CTA Button */}
<Button variant="landing" size="landing" asChild><a className="relative overflow-hidden group px-space-xl py-space-sm rounded-xl bg-gradient-to-b from-luma-tertiary-fixed to-luma-tertiary-container text-luma-on-tertiary font-headline-sm text-headline-sm shadow-[var(--luma-shadow-53)] hover:brightness-105 active:scale-95 transition-all" href={PLATFORM_URL}>
<span className="relative z-10 flex items-center gap-space-xs ">
              Start Your English Journey
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</span>
<div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-luma-surface-container-lowest/80 via-luma-surface-container-lowest/30 to-transparent pointer-events-none rounded-t-xl"></div>
</a></Button>
{/* Secondary Glass Button */}
<Button variant="landing" size="landing" asChild><a className="relative overflow-hidden group px-space-xl py-space-sm rounded-xl bg-luma-surface-container-lowest/90 backdrop-blur-md text-luma-secondary font-headline-sm text-headline-sm shadow-[var(--luma-shadow-16)] hover:bg-luma-surface-container-lowest active:scale-95 transition-all" href={PLATFORM_URL}>
<span className="relative z-10 flex items-center gap-space-xs">
<span className="material-symbols-outlined text-luma-secondary text-[22px]">widgets</span>
              Explore the Platform
            </span>
<div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-luma-surface-container-lowest/90 to-transparent pointer-events-none rounded-t-xl"></div>
</a></Button>
</div>
<div className="mt-space-md flex flex-wrap items-center justify-center gap-space-md text-luma-on-surface-variant font-label-md text-label-md">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-luma-tertiary text-[18px]">lock</span>
            No credit card required
          </span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-luma-primary text-[18px]">verified</span>
            Instant CEFR diagnostic
          </span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-luma-secondary text-[18px]">speed</span>
            15 mins per day
          </span>
</div>
</div>
</div>
</section>
</div></main><footer className="w-full bg-luma-surface-container-low/90 backdrop-blur-md shadow-[var(--luma-shadow-54)] mt-space-xl border-t border-luma-surface-container-lowest/70"><div className="max-w-7xl mx-auto px-margin py-space-xl"><div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg pb-space-lg"><div className="space-y-space-sm"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-luma-primary text-[32px]">school</span><span className="font-headline-sm text-headline-sm text-luma-primary tracking-normal">Ascend English</span></div><p className="font-body-sm text-body-sm text-luma-on-surface-variant">The buoyant next-generation linguistic portal blending Frutiger Aero sensory optimism with conversational mastery.</p></div><div><h4 className="font-label-lg text-label-lg text-luma-on-surface mb-space-sm">Product Hub</h4><ul className="space-y-space-xs font-body-sm text-body-sm text-luma-on-surface-variant"><li><a className="hover:text-luma-primary transition-colors" data-path="features" href="#features">Ecosystem Features</a></li><li><a className="hover:text-luma-primary transition-colors" data-path="learning-levels" href="#levels">Curriculum Levels</a></li><li><a className="hover:text-luma-primary transition-colors" data-path="ai-tutor" href="#tutor">Aero Vocal Engine</a></li><li><a className="hover:text-luma-primary transition-colors" data-path="how-it-works" href="#how">Adaptive Learning Path</a></li></ul></div><div><h4 className="font-label-lg text-label-lg text-luma-on-surface mb-space-sm">Knowledge Base</h4><ul className="space-y-space-xs font-body-sm text-body-sm text-luma-on-surface-variant"><li><a className="hover:text-luma-primary transition-colors" data-path="faq" href="#faq">Frequently Asked Questions</a></li><li><a className="hover:text-luma-primary transition-colors" data-path="pricing" href="#">Institutional Access</a></li><li><a className="hover:text-luma-primary transition-colors" data-path="privacy-policy" href="#">Aero Privacy Guarantee</a></li><li><a className="hover:text-luma-primary transition-colors" data-path="terms-of-service" href="#">Terms of Immersion</a></li></ul></div><div><h4 className="font-label-lg text-label-lg text-luma-on-surface mb-space-sm">Global Dialect Studio</h4><p className="font-body-sm text-body-sm text-luma-on-surface-variant mb-space-sm">Connect to our worldwide English resonance stations.</p><div className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-luma-primary text-[20px]">language</span><span className="font-label-sm text-label-sm text-luma-on-surface-variant">Atmospheric Engine v2.4 Active</span></div></div></div><div className="pt-space-md flex flex-col sm:flex-row items-center justify-between text-luma-on-surface-variant font-body-sm text-body-sm"><p>© 2024 Ascend English Dynamics. Crafted with fluid clarity.</p><div className="flex items-center gap-space-md"><a className="hover:text-luma-on-surface transition-colors" data-path="privacy-policy" href="#">Privacy Policy</a><a className="hover:text-luma-on-surface transition-colors" data-path="terms-of-service" href="#">Terms of Service</a></div></div></div></footer>
    </div>
  );
}
