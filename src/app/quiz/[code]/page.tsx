'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Loader2, ArrowRight, CheckCircle, Clock, Trophy, AlertCircle } from "lucide-react";

type Question = {
  text: string;
  options: string[];
  answer: number; // correct answer index
};

type Quiz = {
  title: string;
  code: string;
  questions: Question[];
  started: boolean;
};

export default function TakeQuizPage() {
  const params = useParams();
  const code = params.code!;
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [showNameScreen, setShowNameScreen] = useState(true);

  // Load name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem(`quiz-${code}-name`);
    const savedAnswers = localStorage.getItem(`quiz-${code}-answers`);
    
    if (savedName) {
      setName(savedName);
      setShowNameScreen(false);
    }
    
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [code]);

  // Save name to localStorage
  useEffect(() => {
    if (name.trim()) {
      localStorage.setItem(`quiz-${code}-name`, name);
    }
  }, [name, code]);

  // Save answers to localStorage
  useEffect(() => {
    if (answers.length > 0 && !answers.every(a => a === -1)) {
      localStorage.setItem(`quiz-${code}-answers`, JSON.stringify(answers));
    }
  }, [answers, code]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted]);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quizzes/${code}`);
        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.error || "Failed to load quiz");
          router.push("/");
          return;
        }
        const data: Quiz = await res.json();
        
        if (!data.started) {
          alert("This quiz has not started yet!");
          router.push("/");
          return;
        }

        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
        setQuizStarted(true);
      } catch (error) {
        alert("Failed to load quiz. Please try again.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [code, router]);

  const handleStartQuiz = () => {
    if (!name.trim()) {
      alert("Please enter your name to continue");
      return;
    }
    setShowNameScreen(false);
  };

  const handleAutoSubmit = async () => {
    if (!name || answers.every(a => a === -1)) return;
    
    try {
      const res = await fetch(`/api/quizzes/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answers }),
      });

      if (res.ok) {
        // Clear local storage on successful submission
        localStorage.removeItem(`quiz-${code}-name`);
        localStorage.removeItem(`quiz-${code}-answers`);
        router.push(`/quiz/${code}/results`);
      }
    } catch (error) {
      console.error("Auto-submit failed:", error);
    }
  };

  const submit = async () => {
    if (!name) return alert("Please enter your name");
    if (answers.includes(-1)) {
      const confirmSubmit = confirm("You haven't answered all questions. Submit anyway?");
      if (!confirmSubmit) return;
    }

    try {
      const res = await fetch(`/api/quizzes/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answers }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit answers");
      }

      // Clear local storage on successful submission
      localStorage.removeItem(`quiz-${code}-name`);
      localStorage.removeItem(`quiz-${code}-answers`);
      
      router.push(`/quiz/${code}/results`);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to submit answers");
      }
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!quiz) return 0;
    const answered = answers.filter(a => a !== -1).length;
    return Math.round((answered / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Not Found</h1>
          <p className="text-gray-400 mb-6">The quiz you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 rounded-lg text-white font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Name Entry Screen
  if (showNameScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-gray-400">Enter your name to start the quiz</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={handleStartQuiz}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Start Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="text-center text-gray-500 text-sm">
              <p>Quiz Code: <span className="font-mono font-bold text-blue-400">{code}</span></p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>30 min time limit</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Trophy className="w-4 h-4" />
                <span>{quiz.questions.length} questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">{quiz.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>{answers.filter(a => a !== -1).length}/{quiz.questions.length} answered</span>
                </div>
              </div>
            </div>

            <button
              onClick={submit}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all px-6 py-3 rounded-xl text-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            >
              Submit Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progress: {calculateProgress()}%</span>
              <span>{answers.filter(a => a !== -1).length}/{quiz.questions.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {quiz.questions.map((q, i) => (
            <div 
              key={i} 
              className={`p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 hover:border-gray-600 ${
                answers[i] !== -1 ? 'border-green-500/30' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  answers[i] !== -1 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {i + 1}
                </div>
                <p className="text-xl font-medium text-white flex-1">{q.text}</p>
                {answers[i] !== -1 && (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                {q.options.map((opt, j) => (
                  <label 
                    key={j}
                    className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      answers[i] === j
                        ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50'
                        : 'bg-gray-900/60 border border-gray-700 hover:bg-gray-800/80'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[i] === j 
                        ? 'border-blue-400 bg-blue-500/20' 
                        : 'border-gray-600'
                    }`}>
                      {answers[i] === j && (
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === j}
                      onChange={() => {
                        const copy = [...answers];
                        copy[i] = j;
                        setAnswers(copy);
                      }}
                      className="hidden"
                    />
                    <span className="text-gray-200 flex-1">{opt}</span>
                    <div className="w-8 h-8 flex items-center justify-center text-gray-500">
                      {String.fromCharCode(65 + j)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Submit Button (Mobile) */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button
            onClick={submit}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all p-4 rounded-full shadow-2xl hover:shadow-3xl active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              <p>Quiz Code: <span className="font-mono font-bold text-blue-400">{code}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to leave? Your progress will be saved.")) {
                    router.push("/");
                  }
                }}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Save & Exit
              </button>
              <button
                onClick={submit}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                Submit All Answers
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}