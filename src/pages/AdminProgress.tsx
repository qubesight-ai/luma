import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/hooks/useDemoMode';
import { ArrowLeft, Loader2, Shield, Users, ListChecks, TrendingUp } from 'lucide-react';

interface Completion {
  id: string;
  user_id: string;
  student_name: string | null;
  student_email: string | null;
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

interface StudentSummary {
  userId: string;
  name: string;
  email: string;
  completions: number;
  avgScore: number;
  curriculum: number;
  lastActivity: string;
}

const scoreTone = (score: number) =>
  score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive';

export default function AdminProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDemoUser } = useDemoMode();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Completion[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user || isDemoUser) {
        setLoading(false);
        return;
      }
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      const { data } = await supabase
        .from('exercise_completions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (data) setRows(data as Completion[]);
      setLoading(false);
    };
    load();
  }, [user, isDemoUser]);

  const students = useMemo<StudentSummary[]>(() => {
    const map = new Map<string, Completion[]>();
    rows.forEach((r) => {
      const list = map.get(r.user_id) || [];
      list.push(r);
      map.set(r.user_id, list);
    });
    return Array.from(map.entries())
      .map(([userId, list]) => ({
        userId,
        name: list[0].student_name || 'Student',
        email: list[0].student_email || '—',
        completions: list.length,
        avgScore: Math.round(list.reduce((s, r) => s + r.score, 0) / list.length),
        curriculum:
          list.find((r) => r.curriculum_overall_percent !== null)?.curriculum_overall_percent ?? 0,
        lastActivity: list[0].created_at,
      }))
      .sort((a, b) => +new Date(b.lastActivity) - +new Date(a.lastActivity));
  }, [rows]);

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRows = rows.filter((r) =>
    `${r.student_name ?? ''} ${r.student_email ?? ''} ${r.exercise_title} ${r.exercise_type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const overallAvg = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                This dashboard is only available to teachers.
              </p>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Home
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            All student completions, scores and curriculum progress in one page.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active students</CardDescription>
              <CardTitle className="text-3xl">{students.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sections completed</CardDescription>
              <CardTitle className="text-3xl">{rows.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average score</CardDescription>
              <CardTitle className="text-3xl">{overallAvg}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Input
          placeholder="Search by student, email or section..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Tabs defaultValue="students">
          <TabsList>
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" /> By student
            </TabsTrigger>
            <TabsTrigger value="activity">
              <ListChecks className="w-4 h-4 mr-2" /> All completions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-4 space-y-3">
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No completions recorded yet.
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((s) => (
                <Card key={s.userId}>
                  <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last activity: {new Date(s.lastActivity).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Sections</div>
                        <div className="font-semibold">{s.completions}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Avg score</div>
                        <Badge variant={scoreTone(s.avgScore)}>{s.avgScore}%</Badge>
                      </div>
                      <div className="w-32">
                        <div className="text-xs text-muted-foreground mb-1">
                          Curriculum {s.curriculum}%
                        </div>
                        <Progress value={s.curriculum} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="p-4 overflow-x-auto">
                {filteredRows.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No completions found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr className="border-b">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Student</th>
                        <th className="py-2 pr-4">Section</th>
                        <th className="py-2 pr-4">Level</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2 pr-4">Curriculum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4">
                            <div className="font-medium">{r.student_name || 'Student'}</div>
                            <div className="text-xs text-muted-foreground">{r.student_email}</div>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="font-medium">{r.exercise_title}</div>
                            <div className="text-xs text-muted-foreground">{r.exercise_type}</div>
                          </td>
                          <td className="py-2 pr-4">{r.level || '—'}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={scoreTone(r.score)}>
                              {r.score}% ({r.correct_answers}/{r.total_questions})
                            </Badge>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="inline-flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {r.curriculum_overall_percent ?? 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
