import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppStateProvider } from "@/hooks/useAppState";
import { GamificationProvider } from "@/hooks/useGamification";
import { AdaptiveLearningProvider } from "@/hooks/useAdaptiveLearning";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Curriculum from "./pages/Curriculum";
import Grammar from "./pages/Grammar";
import Vocabulary from "./pages/Vocabulary";
import Practice from "./pages/Practice";
import Conversation from "./pages/Conversation";
import ConversationHistory from "./pages/ConversationHistory";
import ConversationDetail from "./pages/ConversationDetail";
import Tests from "./pages/Tests";
import Lesson from "./pages/Lesson";
import SkillLesson from "./pages/SkillLesson";
import Settings from "./pages/Settings";
import AdaptiveQuiz from "./pages/AdaptiveQuiz";
import News from "./pages/News";
import Auth from "./pages/Auth";
import ErrorHistory from "./pages/ErrorHistory";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Karaoke from "./pages/Karaoke";
import CustomExam from "./pages/CustomExam";
import SessionExpired from "./pages/SessionExpired";
import AdminUsers from "./pages/AdminUsers";
import DemoLogin from "./pages/DemoLogin";
import NotFound from "./pages/NotFound";
import SpanishCoach from "./pages/SpanishCoach";
import ListeningLab from "./pages/ListeningLab";
import MyProgress from "./pages/MyProgress";
import AdminProgress from "./pages/AdminProgress";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppStateProvider>
        <GamificationProvider>
          <AdaptiveLearningProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public route - Auth page */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/demo-login" element={<DemoLogin />} />
                  
                  {/* Legacy route: approval gate removed */}
                  <Route path="/pending-approval" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/session-expired" element={<SessionExpired />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                  
                  {/* Protected routes - Require login AND approval */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
                  <Route path="/grammar" element={<ProtectedRoute><Grammar /></ProtectedRoute>} />
                  <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
                  <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
                  <Route path="/conversation" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
                  <Route path="/conversation/history" element={<ProtectedRoute><ConversationHistory /></ProtectedRoute>} />
                  <Route path="/conversation/history/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
                  <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
                  <Route path="/lesson/:type/:categoryId/:topicId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
                  <Route path="/skill/:level/:categoryId/:skillId" element={<ProtectedRoute><SkillLesson /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/adaptive-quiz" element={<ProtectedRoute><AdaptiveQuiz /></ProtectedRoute>} />
                  <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
                  <Route path="/error-history" element={<ProtectedRoute><ErrorHistory /></ProtectedRoute>} />
                  <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
                  <Route path="/articles/:articleId" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
                  <Route path="/karaoke" element={<ProtectedRoute><Karaoke /></ProtectedRoute>} />
                  <Route path="/custom-exam" element={<ProtectedRoute><CustomExam /></ProtectedRoute>} />
                  <Route path="/spanish-coach" element={<ProtectedRoute><SpanishCoach /></ProtectedRoute>} />
                  <Route path="/listening-lab" element={<ProtectedRoute><ListeningLab /></ProtectedRoute>} />
                  <Route path="/my-progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
                  <Route path="/admin/progress" element={<ProtectedRoute><AdminProgress /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AdaptiveLearningProvider>
        </GamificationProvider>
      </AppStateProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;