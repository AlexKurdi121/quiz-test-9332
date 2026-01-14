'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, 
  Users, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  ChevronLeft,
  Download,
  Share2,
  Clock,
  Award,
  TrendingUp,
  Home,
  Loader2,
  Crown,
  Target,
  Percent
} from "lucide-react";

type Question = {
  text: string;
  options: string[];
  answer: number;
};

type Participant = {
  id: string;
  name: string;
  answers: number[];
  score: number;
  submittedAt: string;
};

type Quiz = {
  title: string;
  code: string;
  questions: Question[];
  participants: Participant[];
  started: boolean;
  createdAt: string;
};

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'time'>('score');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quizzes/${code}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to load results");
        }
        
        const data: Quiz = await res.json();
        setQuiz(data);
        
        // Sort participants by score (highest first) by default
        if (data.participants) {
          data.participants.sort((a, b) => b.score - a.score);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load quiz results");
        console.error("Error loading quiz:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [code]);

  const handleSort = (criteria: 'score' | 'name' | 'time') => {
    setSortBy(criteria);
    if (!quiz?.participants) return;

    const sorted = [...quiz.participants];
    switch (criteria) {
      case 'score':
        sorted.sort((a, b) => b.score - a.score);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'time':
        sorted.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        break;
    }
    setQuiz({...quiz, participants: sorted});
  };

  const calculateStats = () => {
    if (!quiz?.participants?.length) return null;
    
    const scores = quiz.participants.map(p => p.score);
    const totalQuestions = quiz.questions.length;
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgPercentage = (avgScore / totalQuestions) * 100;
    
    return { avgScore, maxScore, minScore, avgPercentage, totalQuestions };
  };

  const exportResults = () => {
    if (!quiz) return;
    
    const csv = [
      ['Name', 'Score', 'Percentage', 'Submitted At'],
      ...quiz.participants.map(p => [
        p.name,
        p.score,
        `${((p.score / quiz.questions.length) * 100).toFixed(1)}%`,
        new Date(p.submittedAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${quiz.code}.csv`;
    a.click();
  };

  const shareResults = async () => {
    if (!quiz) return;
    
    const shareData = {
      title: `${quiz.title} - Results`,
      text: `Check out the results for "${quiz.title}" quiz!`,
      url: window.location.href,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Results</h1>
          <p className="text-gray-400 mb-6">{error}</p>
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <p className="text-gray-400">No quiz data found.</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push("/")}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Back to Dashboard"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl md:text-3xl font-bold truncate">
                  {quiz.title} - Results
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>Code: <span className="font-mono text-blue-400">{quiz.code}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{quiz.participants?.length || 0} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{quiz.questions.length} questions</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportResults}
                disabled={!quiz.participants?.length}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                title="Export Results"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={shareResults}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                title="Share Results"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && quiz.participants?.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Average Score</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats.avgScore.toFixed(1)}</span>
                <span className="text-gray-400">/ {stats.totalQuestions}</span>
              </div>
              <div className="mt-2 text-blue-400 text-sm">
                {stats.avgPercentage.toFixed(1)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm border border-green-800/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Highest Score</span>
                <Crown className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats.maxScore}</span>
                <span className="text-gray-400">/ {stats.totalQuestions}</span>
              </div>
              <div className="mt-2 text-green-400 text-sm">
                {((stats.maxScore / stats.totalQuestions) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 backdrop-blur-sm border border-yellow-800/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Lowest Score</span>
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats.minScore}</span>
                <span className="text-gray-400">/ {stats.totalQuestions}</span>
              </div>
              <div className="mt-2 text-yellow-400 text-sm">
                {((stats.minScore / stats.totalQuestions) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Completion Rate</span>
                <Percent className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold">
                {quiz.participants?.length || 0}
              </div>
              <div className="mt-2 text-purple-400 text-sm">
                Total Participants
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Leaderboard */}
          <div className="lg:w-2/3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSort('score')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      sortBy === 'score' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    By Score
                  </button>
                  <button
                    onClick={() => handleSort('name')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      sortBy === 'name' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    By Name
                  </button>
                  <button
                    onClick={() => handleSort('time')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      sortBy === 'time' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    By Time
                  </button>
                </div>
              </div>

              {!quiz.participants?.length ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No Participants Yet</h3>
                  <p className="text-gray-500">Share the quiz code to get participants</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quiz.participants.map((participant, index) => {
                    const percentage = (participant.score / quiz.questions.length) * 100;
                    const rank = index + 1;
                    
                    return (
                      <div 
                        key={participant.id}
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setShowDetailsModal(true);
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          rank === 1 ? 'border-yellow-500/50 bg-yellow-500/5' :
                          rank === 2 ? 'border-gray-400/50 bg-gray-400/5' :
                          rank === 3 ? 'border-amber-700/50 bg-amber-700/5' :
                          'border-gray-700 hover:border-gray-600 bg-gray-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                              rank === 2 ? 'bg-gray-400 text-gray-900' :
                              rank === 3 ? 'bg-amber-700 text-amber-100' :
                              'bg-gray-800 text-gray-300'
                            }`}>
                              {rank}
                            </div>
                            <div>
                              <h3 className="font-semibold">{participant.name}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(participant.submittedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {participant.score}<span className="text-gray-500 text-lg">/{quiz.questions.length}</span>
                            </div>
                            <div className={`text-sm font-medium ${
                              percentage >= 80 ? 'text-green-400' :
                              percentage >= 60 ? 'text-yellow-400' :
                              percentage >= 40 ? 'text-orange-400' :
                              'text-red-400'
                            }`}>
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                percentage >= 80 ? 'bg-green-500' :
                                percentage >= 60 ? 'bg-yellow-500' :
                                percentage >= 40 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quiz Info */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Quiz Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Quiz Title</label>
                  <p className="font-medium">{quiz.title}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Quiz Code</label>
                  <p className="font-mono text-blue-400 bg-gray-900/50 px-3 py-1 rounded inline-block">{quiz.code}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Questions</label>
                  <p className="font-medium">{quiz.questions.length}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Status</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${quiz.started ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="font-medium">{quiz.started ? 'Active' : 'Ended'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Created</label>
                  <p className="font-medium">{formatDate(quiz.createdAt)}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="font-medium mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/quiz/${code}`)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Live Quiz
                  </button>
                  <button
                    onClick={exportResults}
                    disabled={!quiz.participants?.length}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Details Modal */}
      {showDetailsModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-2xl font-bold">{selectedParticipant.name}'s Answers</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Score: {selectedParticipant.score}/{quiz.questions.length} • Submitted: {formatDate(selectedParticipant.submittedAt)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const participantAnswer = selectedParticipant.answers[index];
                  const isCorrect = participantAnswer === question.answer;
                  // Removed unused percentage variable
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-5 rounded-xl border-2 ${
                        isCorrect 
                          ? 'border-green-500/30 bg-green-500/5' 
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCorrect 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-medium">{question.text}</h3>
                        </div>
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = participantAnswer === optionIndex;
                          const isCorrectOption = optionIndex === question.answer;
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                isSelected && isCorrectOption
                                  ? 'bg-green-500/20 border-green-500/50'
                                  : isSelected && !isCorrectOption
                                  ? 'bg-red-500/20 border-red-500/50'
                                  : isCorrectOption
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-gray-800/50 border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected && isCorrectOption
                                    ? 'border-green-400 bg-green-500/20'
                                    : isSelected && !isCorrectOption
                                    ? 'border-red-400 bg-red-500/20'
                                    : isCorrectOption
                                    ? 'border-green-400/50 bg-green-500/10'
                                    : 'border-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="flex-1">{option}</span>
                                {isSelected && !isCorrectOption && (
                                  <span className="text-red-400 text-sm font-medium">Your Answer</span>
                                )}
                                {isCorrectOption && (
                                  <span className="text-green-400 text-sm font-medium">Correct Answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}