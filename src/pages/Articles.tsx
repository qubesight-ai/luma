import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, BookOpen, Clock, Search, Filter, 
  GraduationCap, MessageSquare, Headphones, Eye, 
  PenTool, BookText, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { articles, Article } from "@/data/articlesData";

type FilterLevel = 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type FilterCategory = 'all' | 'grammar' | 'vocabulary' | 'speaking' | 'listening' | 'reading' | 'writing';

const levelColors: Record<string, string> = {
  A1: "bg-level-a1",
  A2: "bg-level-a2",
  B1: "bg-level-b1",
  B2: "bg-level-b2",
  C1: "bg-level-c1",
  C2: "bg-level-c2",
};

const levelLabels: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

const categoryIcons: Record<string, React.ReactNode> = {
  grammar: <BookText className="w-4 h-4" />,
  vocabulary: <BookOpen className="w-4 h-4" />,
  speaking: <MessageSquare className="w-4 h-4" />,
  listening: <Headphones className="w-4 h-4" />,
  reading: <Eye className="w-4 h-4" />,
  writing: <PenTool className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  speaking: "Speaking",
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
};

export default function Articles() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("all");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLevel = levelFilter === "all" || article.level === levelFilter;
      const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [searchQuery, levelFilter, categoryFilter]);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, Article[]> = {};
    filteredArticles.forEach(article => {
      const key = article.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(article);
    });
    return groups;
  }, [filteredArticles]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/articles/${articleId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Article Library
              </h1>
              <p className="text-muted-foreground">
                Comprehensive textbook-style explanations for each topic
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles by title, topic or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                {/* Level Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Level:</span>
                  <div className="flex flex-wrap gap-1">
                    {(['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as FilterLevel[]).map(level => (
                      <Button
                        key={level}
                        variant={levelFilter === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLevelFilter(level)}
                        className={cn(
                          "text-xs h-7",
                          levelFilter === level && level !== 'all' && levelColors[level]
                        )}
                      >
                        {level === 'all' ? 'All' : level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Category:</span>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter("all")}
                      className="text-xs h-7"
                    >
                      All
                    </Button>
                    {(['grammar', 'vocabulary'] as FilterCategory[]).map(cat => (
                      <Button
                        key={cat}
                        variant={categoryFilter === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(cat)}
                        className="text-xs h-7"
                      >
                        {categoryIcons[cat]}
                        <span className="ml-1">{categoryLabels[cat]}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
        </div>

        {/* Articles Grid */}
        <ScrollArea className="h-[calc(100vh-400px)]">
          {Object.keys(groupedArticles).length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try different search terms or adjust the filters.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {categoryIcons[category]}
                    </div>
                    <h2 className="font-display text-xl font-semibold">
                      {categoryLabels[category]}
                    </h2>
                    <Badge variant="secondary" className="ml-2">
                      {categoryArticles.length}
                    </Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryArticles.map(article => (
                      <Card 
                        key={article.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                        onClick={() => handleArticleClick(article.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge 
                              className={cn(
                                "text-xs text-white",
                                levelColors[article.level]
                              )}
                            >
                              {article.level} - {levelLabels[article.level]}
                            </Badge>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                              <Clock className="w-3 h-3" />
                              {article.estimatedReadTime} min
                            </div>
                          </div>
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.subtitle}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{article.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full group-hover:bg-primary/10"
                          >
                            Read article
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
