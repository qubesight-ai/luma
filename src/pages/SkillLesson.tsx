import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExerciseQuestion } from "@/components/ExerciseQuestion";
import { SpeakingExercise } from "@/components/SpeakingExercise";
import { WritingExercise } from "@/components/WritingExercise";
import { cleanQuestionForTTS } from "@/lib/questionFormatter";
import { Skill, CEFRLevel } from "@/data/curriculumData";
import { enhancedCurriculumData } from "@/data/enhancedCurriculumData";
import { getExercisesBySkillId, Exercise } from "@/data/exercisesData";
import { getAdvancedExercisesBySkillId } from "@/data/exercisesDataAdvanced";
import { getB1ExercisesCompleteBySkillId } from "@/data/b1ExercisesComplete";
import { getB2ExercisesCompleteBySkillId } from "@/data/b2ExercisesComplete";
import { getC1ExercisesBySkillId } from "@/data/c1Exercises";
import { getC1CompleteExercisesBySkillId } from "@/data/c1ExercisesComplete";
import { getA1ExercisesBySkillId } from "@/data/curriculumExercisesA1";
import { getA2ExercisesBySkillId } from "@/data/curriculumExercisesA2";
import { getB1CurriculumExercisesBySkillId } from "@/data/curriculumExercisesB1";
import { getB2CurriculumExercisesBySkillId } from "@/data/curriculumExercisesB2";
import { getC1CurriculumExercisesBySkillId, getC2CurriculumExercisesBySkillId } from "@/data/curriculumExercisesC1C2";
import { getC2ExercisesCompleteBySkillId } from "@/data/c2ExercisesComplete";
import { getImageExercisesForSkill } from "@/data/imageVocabularyData";
import { getArticleForExercise, getArticleForSkillId } from "@/data/articlesData";
import { getCurriculumArticleById, searchCurriculumArticles } from "@/data/curriculumArticles";
import { getThemesByLevel, generateVocabularyExercises } from "@/data/vocabularyCurriculumComplete";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Volume2, 
  BookOpen, Dumbbell, Trophy, Target, Lightbulb, Star, Image, FileText, ExternalLink, Home, Loader2, Square, Headphones
} from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useExerciseFeedback } from "@/hooks/useExerciseFeedback";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";

type LessonStep = "overview" | "exercises" | "complete";

// Get exercises from the database or generate fallback
const getExercisesForSkill = (skill: Skill, level: CEFRLevel, categoryType: string): Exercise[] => {
  // First try new curriculum exercises by level
  if (level === "A1") {
    const a1Exercises = getA1ExercisesBySkillId(skill.id);
    if (a1Exercises.length > 0) return a1Exercises;
  }
  
  if (level === "A2") {
    const a2Exercises = getA2ExercisesBySkillId(skill.id);
    if (a2Exercises.length > 0) return a2Exercises;
  }
  
  if (level === "B1") {
    const b1CurrExercises = getB1CurriculumExercisesBySkillId(skill.id);
    if (b1CurrExercises.length > 0) return b1CurrExercises;
    const b1Exercises = getB1ExercisesCompleteBySkillId(skill.id);
    if (b1Exercises.length > 0) return b1Exercises;
  }
  
  if (level === "B2") {
    const b2CurrExercises = getB2CurriculumExercisesBySkillId(skill.id);
    if (b2CurrExercises.length > 0) return b2CurrExercises;
    const b2Exercises = getB2ExercisesCompleteBySkillId(skill.id, categoryType);
    if (b2Exercises.length > 0) return b2Exercises;
  }
  
  if (level === "C1") {
    // First try the new complete C1 exercises
    const c1CompleteExercises = getC1CompleteExercisesBySkillId(skill.id);
    if (c1CompleteExercises.length > 0) return c1CompleteExercises;
    // Then try curriculum exercises
    const c1CurrExercises = getC1CurriculumExercisesBySkillId(skill.id);
    if (c1CurrExercises.length > 0) return c1CurrExercises;
    // Finally try the original C1 exercises
    const c1Exercises = getC1ExercisesBySkillId(skill.id, categoryType);
    if (c1Exercises.length > 0) return c1Exercises;
  }
  
  if (level === "C2") {
    const c2CompleteExercises = getC2ExercisesCompleteBySkillId(skill.id);
    if (c2CompleteExercises.length > 0) return c2CompleteExercises;
    const c2Exercises = getC2CurriculumExercisesBySkillId(skill.id);
    if (c2Exercises.length > 0) return c2Exercises;
  }
  
  // Try to get exercises from database
  let exercises = getExercisesBySkillId(skill.id, categoryType);
  
  // If no exercises in main data, try advanced data
  if (exercises.length === 0) {
    exercises = getAdvancedExercisesBySkillId(skill.id, level);
  }
  
  // For vocabulary, use the comprehensive vocabulary curriculum
  if (categoryType.includes('vocab') && exercises.length === 0) {
    // Try to get theme-based exercises from the new vocabulary system
    const themes = getThemesByLevel(level);
    
    // Find matching theme by ID first
    let selectedTheme = themes.find(t => t.id === skill.id);
    
    // If not found by ID, use index-based matching (subtract 1 for 0-based indexing)
    if (!selectedTheme) {
      const indexMatch = skill.id.match(/-(\d+)$/);
      if (indexMatch) {
        const themeIndex = (parseInt(indexMatch[1]) - 1) % themes.length;
        selectedTheme = themes[themeIndex >= 0 ? themeIndex : 0];
      }
    }
    
    if (selectedTheme) {
      const themeExercises = generateVocabularyExercises(selectedTheme);
      if (themeExercises.length > 0) {
        exercises = [...themeExercises, ...exercises];
      }
    }
    
    // Also add image exercises for visual learning
    const imageExercises = getImageExercisesForSkill(skill.id, level);
    exercises = [...exercises, ...imageExercises];
  }
  
  // If still no exercises, generate basic ones based on skill
  if (exercises.length === 0) {
    exercises = skill.subSkills.map((subSkill, index) => ({
      id: `gen-${skill.id}-${index}`,
      type: 'multiple-choice' as const,
      question: `Practice: ${subSkill.title} - Complete this exercise related to ${skill.title}.`,
      options: ["Complete the task", "Skip this exercise", "Review material", "Practice more"],
      correctAnswer: "Complete the task",
      explanation: `This exercise helps you practice ${skill.title} - ${subSkill.title}. Keep practicing to improve!`,
      difficulty: 1 as const,
      tags: [categoryType, level.toLowerCase()]
    }));
  }
  
  return exercises;
};

// Type alias for generated exercises (same as Exercise)
type GeneratedExercise = Exercise;

const generateGrammarExercise = (subSkillTitle: string, skillTitle: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `gram-${index}`,
    type: 'multiple-choice',
    question: `Practice "${subSkillTitle}": She ___ a teacher.`,
    options: ["am", "is", "are", "be"],
    correctAnswer: "is",
    explanation: `We use 'is' with third person singular (she, he, it) - related to ${skillTitle}.`,
    difficulty: 1,
    tags: ["grammar", level.toLowerCase()]
  };
};

const generateVocabularyExercise = (subSkillTitle: string, skillTitle: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `vocab-${index}`,
    type: 'multiple-choice',
    question: `Vocabulary practice for "${subSkillTitle}":`,
    options: [skillTitle, "Animals", "Sports", "Technology"],
    correctAnswer: skillTitle,
    explanation: `"${subSkillTitle}" belongs to the ${skillTitle} category.`,
    difficulty: 1,
    tags: ["vocabulary", level.toLowerCase()]
  };
};

const generateSpeakingExercise = (subSkillTitle: string, skillTitle: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `speak-${index}`,
    type: 'multiple-choice',
    question: `For "${subSkillTitle}", which expression is most appropriate?`,
    options: ["Could you please help me?", "Give me that!", "I want now!", "You must do this!"],
    correctAnswer: "Could you please help me?",
    explanation: "Polite and formal expressions are more appropriate in social contexts.",
    difficulty: 1,
    tags: ["speaking", level.toLowerCase()]
  };
};

const generateListeningExercise = (subSkillTitle: string, skillTitle: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `listen-${index}`,
    type: 'true-false',
    question: `In ${level} listening comprehension, it's important to identify "${subSkillTitle}".`,
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: `Identifying "${subSkillTitle}" is fundamental for listening at ${level} level.`,
    difficulty: 1,
    tags: ["listening", level.toLowerCase()]
  };
};

const generateReadingExercise = (subSkillTitle: string, skillTitle: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `read-${index}`,
    type: 'multiple-choice',
    question: `When reading texts about "${subSkillTitle}", which strategy is most useful?`,
    options: ["Read word by word", "Look for keywords and context", "Ignore unknown words", "Only look at images"],
    correctAnswer: "Look for keywords and context",
    explanation: "Identifying keywords and using context helps better understand the text.",
    difficulty: 1,
    tags: ["reading", level.toLowerCase()]
  };
};

const generateWritingExercise = (subSkillTitle: string, skillTitle: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `write-${index}`,
    type: 'multiple-choice',
    question: `To write about "${subSkillTitle}", what is essential to include?`,
    options: ["Only simple words", "Clear structure and appropriate vocabulary", "Many complicated words", "Always very long texts"],
    correctAnswer: "Clear structure and appropriate vocabulary",
    explanation: "Good writing combines clear structure with vocabulary appropriate to the level.",
    difficulty: 1,
    tags: ["writing", level.toLowerCase()]
  };
};

const generateGenericExercise = (title: string, description: string, level: CEFRLevel, index: number): GeneratedExercise => {
  return {
    id: `gen-${index}`,
    type: 'true-false',
    question: `The topic "${title}" is relevant for ${level} level students.`,
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: `Yes, "${title}" is part of the ${level} curriculum.`,
    difficulty: 1,
    tags: ["general", level.toLowerCase()]
  };
};

// Helper function to get PRE-exercise teaching explanation (without giving the answer)
const getPreExerciseTeaching = (exercise: Exercise): string => {
  const tags = exercise.tags || [];
  
  // Image-match exercises
  if (exercise.type === 'image-match') {
    if (tags.includes('word-to-image')) {
      return "🖼️ VISUAL EXERCISE: Look at the English word and select the image that represents it.\n\n👉 Think about the word's meaning\n👉 Visualize the object in your mind\n👉 Select the correct image";
    }
    return "🖼️ VISUAL EXERCISE: Look carefully at the image.\n\n👉 What object, animal or concept does it represent?\n👉 Think about how it's said in English\n👉 Select the correct word from the options";
  }
  
  // TO BE verb explanations
  if (tags.includes('to-be')) {
    if (tags.includes('affirmative')) {
      return "🔤 RULE: The verb TO BE changes according to the subject:\n• I → am\n• He/She/It → is\n• You/We/They → are\n\n👉 Identify the SUBJECT and choose the correct form.";
    }
    if (tags.includes('negative')) {
      return "🔤 RULE: Negative with TO BE:\n• I am not (I'm not)\n• He/She/It is not (isn't)\n• You/We/They are not (aren't)\n\n👉 First identify the subject, then add 'not' after the verb.";
    }
    if (tags.includes('questions')) {
      return "🔤 RULE: Questions with TO BE - invert the order:\n• Am I...? / Is he/she...? / Are you/we/they...?\n\n👉 In questions, the verb TO BE goes BEFORE the subject.";
    }
    return "🔤 RULE: TO BE = to be in English\n• I → am\n• He/She/It → is\n• You/We/They → are\n\n👉 Look at who performs the action (the subject) to choose the correct form.";
  }
  
  // Present Simple explanations
  if (tags.includes('present-simple')) {
    if (tags.includes('third-person')) {
      return "🔤 RULE: Present Simple with HE/SHE/IT:\n• Add -S to the verb: work→works, play→plays\n• Verbs ending in -ch, -sh, -ss, -x, -o: add -ES: watch→watches\n• Verbs ending in consonant+Y: change Y to -IES: study→studies\n\n👉 Is the subject he/she/it? Then the verb needs -S/-ES.";
    }
    if (tags.includes('negative')) {
      return "🔤 RULE: Negative in Present Simple:\n• I/You/We/They + don't + base verb\n• He/She/It + doesn't + base verb\n\n⚠️ The verb returns to its BASE form! (She doesn't LIKE, not 'likes')";
    }
    if (tags.includes('questions')) {
      return "🔤 RULE: Questions in Present Simple:\n• Do + I/you/we/they + base verb?\n• Does + he/she/it + base verb?\n\n👉 After DO/DOES the verb always goes in base form (without -s).";
    }
    return "🔤 RULE: Present Simple = habitual actions/routines\n• I/You/We/They + base verb\n• He/She/It + verb + S/ES\n\n👉 Identify if the subject is singular (he/she/it) or plural.";
  }
  
  // Present Continuous
  if (tags.includes('present-continuous')) {
    return "🔤 RULE: Present Continuous = action happening right now\nStructure: AM/IS/ARE + verb-ING\n• I am working\n• She is reading\n• They are playing\n\n👉 Look for keywords: now, right now, at the moment, look!";
  }
  
  // Vocabulary - by specific category
  if (tags.includes('food')) {
    return "🍎 VOCABULARY - FOOD:\n• Fruits: apple, banana, orange...\n• Drinks: water, milk, coffee...\n• Meals: bread, cheese, pizza...\n\n👉 Look at the image and think about what food category it belongs to.";
  }
  if (tags.includes('animals')) {
    return "🐾 VOCABULARY - ANIMALS:\n• Pets: dog, cat, bird...\n• Farm: cow, pig, horse...\n• Wild: lion, elephant, bear...\n\n👉 Is it a domestic, farm or wild animal?";
  }
  if (tags.includes('family')) {
    return "👨‍👩‍👧 VOCABULARY - FAMILY:\n• Parents: mother, father\n• Siblings: sister, brother\n• Grandparents: grandmother, grandfather\n\n👉 Think about the family relationship it represents.";
  }
  if (tags.includes('clothes')) {
    return "👕 VOCABULARY - CLOTHES:\n• Upper: shirt, dress, hat\n• Lower: pants, shoes\n• Accessories: glasses, hat\n\n👉 What part of the body does this item cover?";
  }
  if (tags.includes('body')) {
    return "🫀 VOCABULARY - BODY:\n• Head: head, eye, ear, nose, mouth\n• Limbs: hand, foot\n• Organs: heart\n\n👉 Identify what body part the image represents.";
  }
  if (tags.includes('colors')) {
    return "🎨 VOCABULARY - COLORS:\n• Primary: red, blue, yellow\n• Secondary: green, orange, purple\n• Neutral: black, white, brown\n\n👉 Look at the color and remember its English name.";
  }
  if (tags.includes('numbers')) {
    return "🔢 VOCABULARY - NUMBERS:\n• 1-5: one, two, three, four, five\n• 6-10: six, seven, eight, nine, ten\n\n👉 Count mentally and select the correct number.";
  }
  if (tags.includes('weather')) {
    return "🌤️ VOCABULARY - WEATHER:\n• Sunny: sun, hot\n• Rainy: rain, cloud\n• Cold: snow, wind\n\n👉 What weather condition does it represent?";
  }
  if (tags.includes('professions')) {
    return "👨‍⚕️ VOCABULARY - PROFESSIONS:\n• Health: doctor, nurse\n• Education: teacher\n• Services: police, firefighter, chef\n\n👉 What job does this person do?";
  }
  if (tags.includes('sports')) {
    return "⚽ VOCABULARY - SPORTS:\n• Ball sports: soccer, basketball, tennis\n• Water: swimming\n• Athletics: running\n\n👉 What sport or activity does it represent?";
  }
  
  // General vocabulary
  if (tags.includes('vocabulary')) {
    return "📚 VOCABULARY: Read the question carefully.\n\n👉 Think about the thematic category\n👉 Relate words to mental images\n👉 Eliminate options that clearly don't fit";
  }
  
  // Articles
  if (tags.includes('articles')) {
    return "🔤 RULE: Articles A/AN/THE:\n• A + consonant: a book, a car\n• AN + vowel: an apple, an egg\n• THE = specific/unique: the sun, the book (that we already know)\n\n👉 Does it start with a vowel sound? Use AN. Is it specific? Use THE.";
  }
  
  // Possessives
  if (tags.includes('possessive')) {
    return "🔤 RULE: Possessives:\n• My, Your, His, Her\n• Its, Our, Their\n\n👉 Identify WHO the owner is to choose the correct possessive.";
  }
  
  // Default grammar
  if (tags.includes('grammar')) {
    return "🔤 GRAMMAR: Analyze the sentence step by step:\n1. Identify the SUBJECT (who?)\n2. Identify the TENSE (when?)\n3. Apply the corresponding rule\n\n👉 Read all options before deciding.";
  }
  
  return "📖 TIP: Read the complete sentence, identify what type of word is missing (verb, noun, adjective) and think about the context.";
};

// Helper function for detailed post-answer explanation
const getDetailedExplanation = (exercise: Exercise): string => {
  const tags = exercise.tags || [];
  
  if (tags.includes('to-be')) {
    return "Remember: I→am, he/she/it→is, you/we/they→are. In questions, invert the order. In negatives, add 'not'.";
  }
  if (tags.includes('present-simple')) {
    return "In Present Simple: with he/she/it add -s/-es. In negative/question use do/does + base verb (without -s).";
  }
  if (tags.includes('present-continuous')) {
    return "Present Continuous = am/is/are + verb-ING. Used for actions in progress right now.";
  }
  if (tags.includes('vocabulary')) {
    return "Associate words with real images and contexts. Constant practice is key.";
  }
  
  return "Practice identifying the grammatical pattern. With repetition, these rules become automatic.";
};

// Generate exercises based on category type
const generateExercises = (skill: Skill, level: CEFRLevel, categoryId: string): Exercise[] => {
  // First try to get from exercise database
  const dbExercises = getExercisesForSkill(skill, level, categoryId);
  if (dbExercises.length > 0) {
    return dbExercises;
  }
  
  // Fallback: generate exercises based on category
  const categoryType = categoryId.includes('gram') ? 'grammar' 
    : categoryId.includes('vocab') ? 'vocabulary'
    : categoryId.includes('speak') ? 'speaking'
    : categoryId.includes('listen') ? 'listening'
    : categoryId.includes('read') ? 'reading'
    : categoryId.includes('writ') ? 'writing'
    : 'general';
  
  return skill.subSkills.map((subSkill, index) => {
    switch (categoryType) {
      case 'grammar':
        return generateGrammarExercise(subSkill.title, skill.title, level, index);
      case 'vocabulary':
        return generateVocabularyExercise(subSkill.title, skill.title, level, index);
      case 'speaking':
        return generateSpeakingExercise(subSkill.title, skill.title, level, index);
      case 'listening':
        return generateListeningExercise(subSkill.title, skill.title, level, index);
      case 'reading':
        return generateReadingExercise(subSkill.title, skill.title, level, index);
      case 'writing':
        return generateWritingExercise(subSkill.title, skill.title, level, index);
      default:
        return generateGenericExercise(skill.title, subSkill.title, level, index);
    }
  });
};

const levelColors: Record<CEFRLevel, string> = {
  A1: "bg-level-a1",
  A2: "bg-level-a2",
  B1: "bg-level-b1",
  B2: "bg-level-b2",
  C1: "bg-level-c1",
  C2: "bg-level-c2",
};

const levelLabels: Record<CEFRLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

export default function SkillLesson() {
  const navigate = useNavigate();
  const { level, categoryId, skillId } = useParams();
  const [currentStep, setCurrentStep] = useState<LessonStep>("overview");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [completedSubSkills, setCompletedSubSkills] = useState<Set<string>>(new Set());
  const [incorrectAnswers, setIncorrectAnswers] = useState<{ question: string; userAnswer: string; correctAnswer: string }[]>([]);
  const [practiceSessionId, setPracticeSessionId] = useState(0);
  const feedbackSentRef = useRef(false);
  
  const { sendFeedbackToTeacher } = useExerciseFeedback();

  // Find the skill from enhanced curriculum data (includes dynamic B1 speaking/vocabulary)
  const { skill, category, levelData } = useMemo(() => {
    const lvlData = enhancedCurriculumData.find(l => l.level === level);
    if (!lvlData) return { skill: null, category: null, levelData: null };
    
    const cat = lvlData.categories.find(c => c.id === categoryId);
    if (!cat) return { skill: null, category: null, levelData: lvlData };
    
    const sk = cat.skills.find(s => s.id === skillId);
    return { skill: sk ?? null, category: cat, levelData: lvlData };
  }, [level, categoryId, skillId]);

  // Generate exercises based on the skill; shuffle options once per session so position is never a signal
  const exercises = useMemo(() => {
    if (!skill || !categoryId) return [];
    const raw = generateExercises(skill, level as CEFRLevel, categoryId);
    return raw.map((ex) =>
      ex.options?.length ? { ...ex, options: shuffleArray([...ex.options]) } : ex
    );
  }, [skill, level, categoryId, practiceSessionId]);

  const currentExerciseData = exercises[currentExercise];

  const isCorrect = selectedAnswer === currentExerciseData?.correctAnswer;
  const isListeningExercise = categoryId?.includes('listen') || currentExerciseData?.tags?.includes('listening');

  useEffect(() => {
    if (!skill) {
      navigate("/dashboard");
    }
  }, [skill, navigate]);

  if (!skill || !category || !levelData) {
    return null;
  }

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === currentExerciseData.correctAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast({
        title: "Correct! 🎉",
        description: "Excellent work!",
      });
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      // Track incorrect answer for teacher feedback
      const correctAnswerStr = Array.isArray(currentExerciseData.correctAnswer) 
        ? currentExerciseData.correctAnswer.join(', ')
        : currentExerciseData.correctAnswer;
      setIncorrectAnswers(prev => [...prev, {
        question: currentExerciseData.question,
        userAnswer: answer,
        correctAnswer: correctAnswerStr,
      }]);
    }
  };

  const persistCompletedSubSkill = (id: string) => {
    try {
      const saved = localStorage.getItem("curriculum-progress");
      const arr: string[] = saved ? JSON.parse(saved) : [];
      if (!arr.includes(id)) {
        arr.push(id);
        localStorage.setItem("curriculum-progress", JSON.stringify(arr));
      }
    } catch (e) {
      console.error("Failed to persist curriculum progress", e);
    }
  };

  const handleNextExercise = async () => {
    // Mark subSkill as completed (local + persisted for Curriculum view)
    if (skill.subSkills[currentExercise]) {
      const subSkillId = skill.subSkills[currentExercise].id;
      setCompletedSubSkills(prev => new Set([...prev, subSkillId]));
      persistCompletedSubSkill(subSkillId);
    }

    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Send feedback to teacher when exercise is completed
      if (!feedbackSentRef.current) {
        feedbackSentRef.current = true;
        const percentage = Math.round(((score.correct + (selectedAnswer === currentExerciseData?.correctAnswer ? 1 : 0)) / exercises.length) * 100);
        
        sendFeedbackToTeacher({
          exerciseType: categoryId?.includes('gram') ? 'Grammar' 
            : categoryId?.includes('vocab') ? 'Vocabulary'
            : categoryId?.includes('speak') ? 'Speaking'
            : categoryId?.includes('listen') ? 'Listening'
            : categoryId?.includes('read') ? 'Reading'
            : categoryId?.includes('writ') ? 'Writing'
            : 'Practice',
          exerciseTitle: skill.title,
          level: level || 'Unknown',
          score: percentage,
          totalQuestions: exercises.length,
          correctAnswers: score.correct + (selectedAnswer === currentExerciseData?.correctAnswer ? 1 : 0),
          incorrectAnswers: incorrectAnswers,
        }).then(result => {
          if (result.success) {
            console.log("Teacher feedback sent successfully");
          } else {
            console.error("Failed to send teacher feedback:", result.error);
          }
        });
      }
      
      setCurrentStep("complete");
    }
  };

  // ElevenLabs TTS
  const { speak, stopAudio, isLoading: isSpeaking, isPlaying } = useElevenLabsTTS();

  const speakText = (text: string) => {
    if (isPlaying) {
      stopAudio();
    } else {
      speak(text);
    }
  };

  if (currentStep === "complete") {
    const percentage = Math.round((score.correct / exercises.length) * 100);
    const xpEarned = 25 + (score.correct * 10);
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden">
              <div className={cn("p-6 text-white", levelColors[level as CEFRLevel])}>
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="w-8 h-8" />
                  <h2 className="font-display font-bold text-2xl">Mission Complete!</h2>
                </div>
              </div>
              
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-success fill-success" />
                </div>
                
                <h3 className="font-display font-bold text-xl mb-2">
                  {skill.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  You have completed this {level} level skill
                </p>
                
                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-success">{score.correct}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-destructive">{score.incorrect}</p>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-primary">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <p className="text-lg font-bold">+{xpEarned} XP earned</p>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                  <Button variant="hero" onClick={() => navigate("/curriculum")}>
                    Continue Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with navigation */}
          <div className="mb-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <span className="text-muted-foreground">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/curriculum")}
            >
              Curriculum
            </Button>
          </div>

          {/* Skill Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg",
              levelColors[level as CEFRLevel]
            )}>
              {level}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-2xl">{skill.title}</h1>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  levelColors[level as CEFRLevel].replace('bg-', 'border-').replace('bg-', 'text-')
                )}>
                  {levelLabels[level as CEFRLevel]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{category.title} • {skill.description}</p>
            </div>
          </div>

          {/* Step Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentStep === "overview" 
                  ? "bg-primary text-white" 
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
              onClick={() => setCurrentStep("overview")}
            >
              <BookOpen className="w-4 h-4" />
              Overview
            </button>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentStep === "exercises" 
                  ? "bg-primary text-white" 
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
              onClick={() => setCurrentStep("exercises")}
            >
              <Dumbbell className="w-4 h-4" />
              Practice
            </button>
          </div>

          {/* Content */}
          {currentStep === "overview" && (
            <Card>
              <CardContent className="p-8">
                {/* Skill Overview */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-lg">Learning Objectives</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {skill.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upon completing this lesson, you will master {skill.subSkills.length} key sub-skills.
                  </p>
                </div>

                {/* Related article link (for C1 grammar, etc.) */}
                {skill && (() => {
                  const overviewArticle = getArticleForSkillId(skill.id);
                  if (!overviewArticle) return null;
                  return (
                    <div className="mb-8">
                      <Button
                        variant="outline"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => navigate(`/articles/${overviewArticle.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Read full article: {overviewArticle.title}
                      </Button>
                    </div>
                  );
                })()}

                {/* SubSkills */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    <h3 className="font-display font-semibold text-lg">Content to Practice</h3>
                  </div>
                  <div className="space-y-2">
                    {skill.subSkills.map((subSkill, index) => (
                      <div
                        key={subSkill.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border transition-colors hover:bg-secondary"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          completedSubSkills.has(subSkill.id) 
                            ? "bg-success text-white" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {completedSubSkills.has(subSkill.id) ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={cn(
                          "font-medium",
                          completedSubSkills.has(subSkill.id) && "text-success"
                        )}>
                          {subSkill.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Exercises Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setPracticeSessionId((s) => s + 1);
                    setCurrentStep("exercises");
                    setCurrentExercise(0);
                    setScore({ correct: 0, incorrect: 0 });
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }}
                >
                  <Dumbbell className="w-5 h-5 mr-2" />
                  Start Practice
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "exercises" && currentExerciseData && (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Exercise {currentExercise + 1} of {exercises.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {score.correct} correct • {score.incorrect} incorrect
                  </span>
                </div>
                <Progress 
                  value={((currentExercise + 1) / exercises.length) * 100} 
                  className="h-2"
                />
              </div>

              {/* Check if this is a speaking exercise */}
              {categoryId?.includes('speak') || currentExerciseData.tags?.includes('speaking') ? (
                // Speaking Exercise with TTS and Voice Practice
                <div className="space-y-6">
                  <SpeakingExercise
                    question={currentExerciseData.question}
                    options={currentExerciseData.options}
                    correctAnswer={Array.isArray(currentExerciseData.correctAnswer) 
                      ? currentExerciseData.correctAnswer[0] 
                      : currentExerciseData.correctAnswer}
                    explanation={currentExerciseData.explanation}
                    onAnswer={(answer, correct) => {
                      setSelectedAnswer(answer);
                      setShowExplanation(true);
                      if (correct) {
                        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
                        toast({
                          title: "Correct! 🎉",
                          description: "Excellent work!",
                        });
                        // Mark subskill as completed (local + persisted)
                        const subSkill = skill.subSkills[currentExercise % skill.subSkills.length];
                        if (subSkill) {
                          setCompletedSubSkills(prev => new Set([...prev, subSkill.id]));
                          persistCompletedSubSkill(subSkill.id);
                        }
                      } else {
                        setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
                        // Track incorrect answer for teacher feedback
                        const correctAnswerStr = Array.isArray(currentExerciseData.correctAnswer) 
                          ? currentExerciseData.correctAnswer.join(', ')
                          : currentExerciseData.correctAnswer;
                        setIncorrectAnswers(prev => [...prev, {
                          question: currentExerciseData.question,
                          userAnswer: answer,
                          correctAnswer: correctAnswerStr,
                        }]);
                      }
                    }}
                    showExplanation={showExplanation}
                    selectedAnswer={selectedAnswer}
                  />
                  
                  {/* Next Button for Speaking */}
                  {showExplanation && (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleNextExercise}
                    >
                      {currentExercise < exercises.length - 1 ? (
                        <>
                          Next exercise
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          View results
                          <Trophy className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : categoryId?.includes('writ') || currentExerciseData.tags?.includes('writing') ? (
                // Writing Exercise with text input and live feedback
                <div className="space-y-6">
                  <WritingExercise
                    question={currentExerciseData.question}
                    options={currentExerciseData.options}
                    correctAnswer={Array.isArray(currentExerciseData.correctAnswer) 
                      ? currentExerciseData.correctAnswer[0] 
                      : currentExerciseData.correctAnswer}
                    explanation={currentExerciseData.explanation}
                    onAnswer={(answer, correct) => {
                      setSelectedAnswer(answer);
                      setShowExplanation(true);
                      if (correct) {
                        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
                        toast({
                          title: "Correct! 🎉",
                          description: "Great writing!",
                        });
                        // Mark subskill as completed
                        const subSkill = skill.subSkills[currentExercise % skill.subSkills.length];
                        if (subSkill) {
                          setCompletedSubSkills(prev => new Set([...prev, subSkill.id]));
                        }
                      } else {
                        setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
                        // Track incorrect answer for teacher feedback
                        const correctAnswerStr = Array.isArray(currentExerciseData.correctAnswer) 
                          ? currentExerciseData.correctAnswer.join(', ')
                          : currentExerciseData.correctAnswer;
                        setIncorrectAnswers(prev => [...prev, {
                          question: currentExerciseData.question,
                          userAnswer: answer,
                          correctAnswer: correctAnswerStr,
                        }]);
                      }
                    }}
                    showExplanation={showExplanation}
                    selectedAnswer={selectedAnswer}
                  />
                  
                  {/* Next Button for Writing */}
                  {showExplanation && (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleNextExercise}
                    >
                      {currentExercise < exercises.length - 1 ? (
                        <>
                          Next exercise
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          View results
                          <Trophy className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
              <Card>
                <CardContent className="p-8">
                  {/* Current SubSkill Context - find from exercise tags */}
                  {(() => {
                    // Try to find subskill from exercise tags
                    const subSkillTag = currentExerciseData.tags?.find(tag => tag.startsWith('subskill:'));
                    if (subSkillTag) {
                      const subSkillId = subSkillTag.replace('subskill:', '');
                      const matchedSubSkill = skill.subSkills.find(ss => ss.id === subSkillId);
                      if (matchedSubSkill) {
                        return (
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary" className="text-xs">
                              {matchedSubSkill.title}
                            </Badge>
                          </div>
                        );
                      }
                    }
                    // Fallback to index-based display if no subskill tag
                    const fallbackSubSkill = skill.subSkills[currentExercise % skill.subSkills.length];
                    if (fallbackSubSkill) {
                      return (
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs">
                            {fallbackSubSkill.title}
                          </Badge>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Pre-Exercise Teaching - Grammar rule WITHOUT giving the answer */}
                  {!showExplanation && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-primary mb-2">
                            📚 Before answering, remember:
                          </h3>
                          <div className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-background/50 rounded-lg p-3 border">
                            {getPreExerciseTeaching(currentExerciseData)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Question with image for image-match type */}
                  <div className="mb-6">
                    {currentExerciseData.type === 'image-match' && currentExerciseData.imageUrl && (
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-7xl">{currentExerciseData.imageUrl}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Image className="w-3 h-3 mr-1" />
                          Visual Exercise
                        </Badge>
                      </div>
                    )}
                    {/* Hide question text for listening exercises - only allow audio */}
                    {isListeningExercise ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Headphones className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          Listen carefully and choose the correct answer
                        </p>
                      </div>
                    ) : (
                      <ExerciseQuestion 
                        question={currentExerciseData.question}
                        className="text-center"
                      />
                    )}
                  </div>

                  {/* Audio button and Article link */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Button
                      variant={isListeningExercise ? "default" : "outline"}
                      size={isListeningExercise ? "default" : "sm"}
                      onClick={() => speakText(cleanQuestionForTTS(currentExerciseData.question))}
                      className={isListeningExercise ? "text-sm px-6" : "text-xs"}
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      {isListeningExercise ? "🎧 Listen to Question" : "Listen to question"}
                    </Button>
                    {(() => {
                      const relatedArticle = getArticleForExercise(currentExerciseData.tags || []);
                      if (relatedArticle) {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/articles/${relatedArticle.id}`)}
                            className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Read full article
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Options - Grid for image-match, List for others */}
                  {currentExerciseData.type === 'image-match' && currentExerciseData.tags?.includes('word-to-image') ? (
                    // Emoji grid for word-to-image exercises
                    <div className="grid grid-cols-2 gap-3">
                      {currentExerciseData.options.map((option) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectOption = option === currentExerciseData.correctAnswer;
                        
                        return (
                          <button
                            key={option}
                            className={cn(
                              "p-6 rounded-xl border-2 font-medium transition-all flex flex-col items-center justify-center gap-2",
                              !showExplanation && "hover:border-primary hover:bg-primary/5 hover:scale-105",
                              !showExplanation && isSelected && "border-primary bg-primary/10 scale-105",
                              showExplanation && isCorrectOption && "border-success bg-success/10",
                              showExplanation && isSelected && !isCorrect && "border-destructive bg-destructive/10"
                            )}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={showExplanation}
                          >
                            <span className="text-5xl">{option}</span>
                            {showExplanation && isCorrectOption && (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            )}
                            {showExplanation && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Standard list for other exercises
                    <div className="space-y-3">
                      {currentExerciseData.options.map((option) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectOption = option === currentExerciseData.correctAnswer;
                        
                        return (
                          <button
                            key={option}
                            className={cn(
                              "w-full p-4 rounded-xl border-2 text-left font-medium transition-all",
                              !showExplanation && "hover:border-primary hover:bg-primary/5",
                              !showExplanation && isSelected && "border-primary bg-primary/10",
                              showExplanation && isCorrectOption && "border-success bg-success/10 text-success",
                              showExplanation && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive"
                            )}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={showExplanation}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {showExplanation && isCorrectOption && (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              )}
                              {showExplanation && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-destructive" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Post-Answer Explanation - AFTER answering */}
                  {showExplanation && (
                    <div className={cn(
                      "mt-6 p-4 rounded-xl",
                      isCorrect ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20"
                    )}>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          isCorrect ? "bg-success/20" : "bg-warning/20"
                        )}>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-2">
                            {isCorrect ? "Excellent! 🎉" : isListeningExercise ? "That's not quite right. Listen again to practice! 🎧" : `The correct answer is: "${currentExerciseData.correctAnswer}"`}
                          </p>
                          
                          {/* English explanation */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              📚 Explanation:
                            </p>
                            <p className="text-sm text-foreground">
                              {currentExerciseData.explanation}
                            </p>
                          </div>

                          {/* Why this answer works */}
                          <div className="mt-3 pt-2 border-t border-border/50">
                            <p className="text-xs font-medium text-primary mb-1">
                              🎯 Why is this the correct answer?
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getDetailedExplanation(currentExerciseData)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Button */}
                  {showExplanation && (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full mt-6"
                      onClick={handleNextExercise}
                    >
                      {currentExercise < exercises.length - 1 ? (
                        <>
                          Next exercise
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          View results
                          <Trophy className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
