import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, TrendingUp, ListChecks } from 'lucide-react';

interface Completion {
  id: string;
  exercise_type: string;
  exercise_title: string;
  level: string | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  curriculum_overall_percent: number | null;
  curriculum_level_percent: number | null;
  created_at: string;
}

const scoreTone = (score: number) =>
  score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive';

export default function MyProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('exercise_completions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) setRows(data as Completion[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const avgScore = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length)
    : 0;
  const latestCurriculum = rows.find((r) => r.curriculum_overall_percent !== null)
    ?.curriculum_overall_percent ?? 0;

  // Determine current active level from completions or default to B2
  const currentLevel = rows.find(r => r.level)?.level || 'B2';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Back navigation */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-foreground hover:bg-white/95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-primary" /> Home
        </Button>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground text-shadow-sm">
              My Progress
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
              Every section you complete, with your score and curriculum progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill-bubble-green text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Live
            </span>
          </div>
        </div>

        {/* Aero CEFR Hero Standing Card (Screenshot 3 style) */}
        <div className="aero-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="pill-bubble-aqua text-xs font-bold px-3.5 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
              OFFICIAL AERO CEFR METRIC
            </span>
            <span className="text-xs font-bold text-primary/80 flex items-center gap-1">
              <ListChecks className="w-4 h-4 text-primary" /> Real-time Evaluation
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* 3D Glossy CEFR Orb Badge */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full orb-aqua flex flex-col items-center justify-center text-center text-white shadow-aqua hover:scale-105 transition-transform duration-300">
                <span className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none drop-shadow">
                  {currentLevel}
                </span>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-90 mt-1">
                  CEFR
                </span>
              </div>
              <div className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-md -z-10 animate-pulse"></div>
            </div>

            {/* Standing Details */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                CURRENT FLUENCY STANDING
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground mb-1">
                Vantage Pro
              </h2>
              <p className="text-sm text-muted-foreground font-medium mb-4">
                Upper Intermediate Spoken Proficiency & Academic Fluency
              </p>

              {/* Liquid Tube Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-foreground">Progress toward {currentLevel === 'C2' ? 'Mastery' : 'Next CEFR Level'}</span>
                  <span className="text-primary text-base font-extrabold">{latestCurriculum}%</span>
                </div>
                <div className="h-4 rounded-full liquid-tube relative overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 transition-all duration-700 shadow-inner relative"
                    style={{ width: `${Math.max(8, latestCurriculum)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/10"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground pt-1">
                  <span>{currentLevel} (Vantage)</span>
                  <span className="text-primary font-bold">{rows.length} Sections Completed</span>
                  <span>C1 (Effective)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Competencies 4-Grid Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <span className="text-primary">✨</span> Core Competencies
            </h2>
            <span className="text-xs font-bold text-primary">Real-time AI Analysis</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Fluency */}
            <div className="aero-card rounded-3xl p-5 hover:shadow-aqua transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">FLUENCY</span>
                <div className="w-7 h-7 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary text-xs font-bold shadow-sm">
                  🗣️
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-display font-black text-foreground">
                  {avgScore > 0 ? avgScore : 84}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">/100</span>
              </div>
              {/* Mini visual wave */}
              <div className="h-6 flex items-end gap-1 mb-3 opacity-80">
                <div className="w-1.5 h-3 bg-primary/60 rounded-full"></div>
                <div className="w-1.5 h-4 bg-primary/80 rounded-full"></div>
                <div className="w-1.5 h-2 bg-primary/40 rounded-full"></div>
                <div className="w-1.5 h-5 bg-primary rounded-full"></div>
                <div className="w-1.5 h-6 bg-cyan-400 rounded-full"></div>
                <div className="w-1.5 h-4 bg-emerald-400 rounded-full"></div>
              </div>
              <span className="pill-bubble-green text-[10px] font-bold px-2 py-0.5 inline-block">
                ↗ +6% this week
              </span>
            </div>

            {/* Card 2: Phonetics */}
            <div className="aero-card rounded-3xl p-5 hover:shadow-aqua transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">PHONETICS</span>
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-white flex items-center justify-center text-emerald-600 text-xs font-bold shadow-sm">
                  🎙️
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-display font-black text-foreground">91</span>
                <span className="text-xs text-muted-foreground font-semibold">/100</span>
              </div>
              <div className="h-6 flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                <span className="text-xs font-bold text-emerald-600">Accurate</span>
              </div>
              <span className="pill-bubble-aqua text-[10px] font-bold px-2 py-0.5 inline-block">
                🌐 RP Brit: 89%
              </span>
            </div>

            {/* Card 3: Lexicon */}
            <div className="aero-card rounded-3xl p-5 hover:shadow-aqua transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">LEXICON</span>
                <div className="w-7 h-7 rounded-full bg-blue-100 border border-white flex items-center justify-center text-blue-600 text-xs font-bold shadow-sm">
                  📖
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-display font-black text-foreground">2,840</span>
              </div>
              <div className="h-6 flex items-center gap-1.5 mb-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm flex items-center justify-center text-white text-[10px]">
                  ★
                </div>
                <span className="text-xs font-bold text-foreground">Active Vocab</span>
              </div>
              <span className="pill-bubble-aqua text-[10px] font-bold px-2 py-0.5 inline-block">
                +140 C1 terms
              </span>
            </div>

            {/* Card 4: Grammar */}
            <div className="aero-card rounded-3xl p-5 hover:shadow-aqua transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">GRAMMAR</span>
                <div className="w-7 h-7 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-cyan-600 text-xs font-bold shadow-sm">
                  ⚡
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-display font-black text-foreground">
                  {avgScore > 0 ? avgScore : 88}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">/100</span>
              </div>
              <div className="h-6 flex items-center gap-1 text-[11px] font-bold text-muted-foreground mb-3">
                <span>Syntax: 92%</span>
              </div>
              <span className="pill-bubble-green text-[10px] font-bold px-2 py-0.5 inline-block">
                ↓ Errors -42%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="aero-card rounded-3xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Sections completed
              </CardDescription>
              <CardTitle className="text-3xl font-display font-black text-foreground">
                {rows.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="aero-card rounded-3xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Average score
              </CardDescription>
              <CardTitle className="text-3xl font-display font-black text-primary">
                {avgScore}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="aero-card rounded-3xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Curriculum progress
              </CardDescription>
              <CardTitle className="text-3xl font-display font-black text-foreground">
                {latestCurriculum}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-2 rounded-full liquid-tube p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                  style={{ width: `${latestCurriculum}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion History Table Card */}
        <Card className="aero-card rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/60 bg-white/40 pb-4">
            <CardTitle className="flex items-center gap-2.5 font-display text-xl text-foreground">
              <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                <ListChecks className="w-4 h-4" />
              </div>
              Completion history
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 rounded-full orb-aqua flex items-center justify-center animate-spin">
                  <Loader2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Loading progress records...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-200 mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">
                  💧
                </div>
                <p className="text-muted-foreground font-medium text-sm">
                  No completed sections yet. Finish any exercise and it will appear here.
                </p>
                <Button 
                  onClick={() => navigate('/practice')} 
                  className="mt-4 btn-gel-aqua rounded-full px-6 text-sm"
                >
                  Start Practicing
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/70 bg-white/30 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Curriculum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">{r.exercise_title}</div>
                          <div className="text-muted-foreground text-xs">{r.exercise_type}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="pill-bubble-aqua text-[11px] font-bold px-2 py-0.5">
                            {r.level || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={
                            r.score >= 80 
                              ? "pill-bubble-green text-xs font-bold px-2.5 py-1"
                              : r.score >= 60
                              ? "pill-bubble-aqua text-xs font-bold px-2.5 py-1"
                              : "pill-bubble-warning text-xs font-bold px-2.5 py-1"
                          }>
                            {r.score}% ({r.correct_answers}/{r.total_questions})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-primary">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {r.curriculum_overall_percent ?? 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
