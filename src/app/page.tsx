'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import QuestionInput from '../components/QuestionInput';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  StopCircle, 
  BarChart3, 
  X, 
  Check, 
  AlertCircle,
  Copy,
  ChevronRight,
  Menu,
  X as CloseIcon
} from 'lucide-react';

type Question = {
  text: string;
  options: string[];
  answer: number;
};

type Participant = {
  name: string;
  answers: number[];
  score: number;
};

type Quiz = {
  id: number;
  code: string;
  title: string;
  started: boolean;
  questions: Question[];
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'quiz'>('quiz');
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [resultQuiz, setResultQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quizzes');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setQuizList(data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unknown error occurred while fetching quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchParticipants = async (code: string) => {
    try {
      const res = await fetch(`/api/quizzes/${code}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch results: ${res.statusText}`);
      }
      const data = await res.json();
      setParticipants(data.participants || []);
      setResultQuiz(data);
      setResultsModalOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to fetch results: Unknown error');
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingQuiz(null);
    setNumQuestions(1);
    setQuestions([]);
    setShowModal(true);
  };

  const handleOpenEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setNumQuestions(quiz.questions.length);
    setQuestions([...quiz.questions]);
    setShowModal(true);
  };

  const updateQuestion = (index: number, q: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = q;
    setQuestions(newQuestions);
  };

  const handleSaveQuiz = async () => {
    if (!questions.length || questions.some(q => !q.text.trim())) {
      alert('Please fill in all questions!');
      return;
    }

    try {
      if (editingQuiz) {
        const res = await fetch(`/api/quizzes/${editingQuiz.code}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editingQuiz.title, questions }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to update quiz: ${res.statusText}`);
        }
      } else {
        const title = prompt('Quiz Title') || 'Untitled Quiz';
        const res = await fetch('/api/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, questions }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to create quiz: ${res.statusText}`);
        }
      }

      setShowModal(false);
      fetchQuizzes();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred while saving the quiz');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
    {/* Mobile Header with Hamburger Menu */}
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quiz Dashboard
            </h1>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden xs:inline">New Quiz</span>
        </button>
      </div>
    </div>

    {/* Overlay for mobile sidebar */}
    {sidebarOpen && (
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* MAIN LAYOUT CONTAINER - FIXED */}
    <div className="flex min-h-screen pt-16 lg:pt-0">
      {/* Sidebar for desktop, overlay for mobile */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 lg:w-64 lg:flex-shrink-0
      `}>
        <Sidebar 
          active={activeTab} 
          setActive={(tab) => {
            setActiveTab(tab as 'quiz');
            setSidebarOpen(false);
          }} 
        />
      </div>

      {/* Main Content - FIXED LAYOUT */}
      <main className="flex-1 overflow-auto">
        {/* Desktop Header */}
        <div className="hidden lg:block p-6 pb-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Create, manage, and monitor your quizzes
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <Plus size={20} />
              Add New Quiz
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Quiz Stats - Improved for mobile */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Quizzes</p>
                  <p className="text-xl sm:text-2xl font-bold">{quizList.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {quizList.filter(q => q.started).length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Inactive</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-600">
                    {quizList.filter(q => !q.started).length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Questions</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {quizList.reduce((acc, q) => acc + q.questions.length, 0)}
                  </p>
                </div>
              </div>

              {/* Quiz List - Improved responsive grid */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {quizList.length === 0 ? (
                  <div className="col-span-full text-center py-8 sm:py-12">
                    <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <AlertCircle className="text-gray-400 w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium mb-2">No quizzes yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                      Create your first quiz to get started
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
                    >
                      <Plus size={16} />
                      Create Quiz
                    </button>
                  </div>
                ) : (
                  quizList.map((q, idx) => (
                    <div 
                      key={q.code} 
                      className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    >
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${q.started ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              {q.started ? 'Live' : 'Draft'}
                            </span>
                          </div>
                          <h3 className="font-bold text-base sm:text-lg truncate">{q.title}</h3>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                            <span className="text-xs sm:text-sm font-mono bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate">
                              {q.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(q.code)}
                              className="p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                              title="Copy code"
                            >
                              <Copy size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ml-2">
                          #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                          Questions: <span className="font-medium">{q.questions.length}</span>
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                          <div 
                            className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (q.questions.length / 10) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons - Improved for mobile */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                          <Edit size={12} className="sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete this quiz?')) return;
                            
                            try {
                              const res = await fetch(`/api/quizzes/${q.code}`, { method: 'DELETE' });
                              if (!res.ok) {
                                const errorData = await res.json().catch(() => ({}));
                                throw new Error(errorData.message || `Failed to delete quiz: ${res.statusText}`);
                              }
                              fetchQuizzes();
                            } catch (error) {
                              if (error instanceof Error) {
                                alert(error.message);
                              } else {
                                alert('An unexpected error occurred while deleting the quiz');
                              }
                            }
                          }}
                          className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                          <Trash2 size={12} className="sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline sm:inline">Delete</span>
                        </button>
                        {!q.started ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/quizzes/${q.code}/start`, { method: 'POST' });
                                if (!res.ok) {
                                  const errorData = await res.json().catch(() => ({}));
                                  throw new Error(errorData.message || `Failed to start quiz: ${res.statusText}`);
                                }
                                fetchQuizzes();
                              } catch (error) {
                                if (error instanceof Error) {
                                  alert(error.message);
                                } else {
                                  alert('An unexpected error occurred while starting the quiz');
                                }
                              }
                            }}
                            className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors col-span-2"
                          >
                            <Play size={12} className="sm:w-4 sm:h-4" />
                            <span className="truncate">Start Quiz</span>
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/quizzes/${q.code}/disable`, { method: 'POST' });
                                if (!res.ok) {
                                  const errorData = await res.json().catch(() => ({}));
                                  throw new Error(errorData.message || `Failed to disable quiz: ${res.statusText}`);
                                }
                                fetchQuizzes();
                              } catch (error) {
                                if (error instanceof Error) {
                                  alert(error.message);
                                } else {
                                  alert('An unexpected error occurred while disabling the quiz');
                                }
                              }
                            }}
                            className="flex items-center justify-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors col-span-2"
                          >
                            <StopCircle size={12} className="sm:w-4 sm:h-4" />
                            <span className="truncate">End Quiz</span>
                          </button>
                        )}
                        <button
                          onClick={() => fetchParticipants(q.code)}
                          className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors col-span-2"
                        >
                          <BarChart3 size={12} className="sm:w-4 sm:h-4" />
                          <span className="truncate">View Results</span>
                          <ChevronRight size={12} className="sm:w-4 sm:h-4 hidden sm:inline" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Copy Feedback */}
          {copyFeedback && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-lg animate-fade-in-out text-sm sm:text-base">
              {copyFeedback}
            </div>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                      {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                      {editingQuiz ? `Editing: ${editingQuiz.title}` : 'Configure your quiz questions'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
                  {/* Questions Controls */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
                    <label className="block text-sm font-medium mb-2">
                      Number of Questions
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full sm:w-48 accent-blue-500"
                      />
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Math.min(20, Math.max(1, Number(e.target.value))))}
                          className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 w-16 sm:w-20 text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Qty"
                        />
                        <button
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto text-sm sm:text-base"
                          onClick={() =>
                            setQuestions(
                              Array(numQuestions).fill({
                                text: '',
                                options: ['', '', '', ''],
                                answer: 0,
                              })
                            )
                          }
                        >
                          <Plus size={16} className="sm:w-4 sm:h-4" />
                          Generate Questions
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Questions List */}
                  {questions.length > 0 && (
                    <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-auto pr-1 sm:pr-2">
                      {questions.map((q, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-bold">
                              {i + 1}
                            </span>
                            <h3 className="font-medium text-sm sm:text-base">Question {i + 1}</h3>
                          </div>
                          <QuestionInput
                            index={i}
                            question={q}
                            onChange={(q) => updateQuestion(i, q)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-3 py-2 sm:px-5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors w-full sm:w-auto text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveQuiz}
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-lg font-medium shadow-lg transition-colors w-full sm:w-auto text-sm sm:text-base"
                    >
                      <Check size={16} className="sm:w-5 sm:h-5" />
                      {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Modal */}
          {resultsModalOpen && resultQuiz && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                      Results: {resultQuiz.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                      Code: {resultQuiz.code} • {participants.length} participants
                    </p>
                  </div>
                  <button
                    onClick={() => setResultsModalOpen(false)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
                  {participants.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <BarChart3 className="mx-auto text-gray-400 mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12" />
                      <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No participants yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Share the quiz code to get participants
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {participants.map((p, idx) => (
                        <div
                          key={p.name}
                          className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                {idx + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-base sm:text-lg">{p.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                  Score: {p.score}/{resultQuiz.questions.length}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-base">
                              {Math.round((p.score / resultQuiz.questions.length) * 100)}%
                            </div>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            {resultQuiz.questions.map((q, i) => {
                              const isCorrect = p.answers[i] === q.answer;
                              return (
                                <div key={i} className="border-l-4 pl-3 sm:pl-4 py-1.5 sm:py-2 border-gray-200 dark:border-gray-700">
                                  <p className="font-medium text-sm sm:text-base mb-1">
                                    Q{i + 1}: {q.text}
                                  </p>
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="text-xs sm:text-sm">Your answer:</span>
                                    <span className={`font-medium text-xs sm:text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                      {q.options[p.answers[i]] || 'Not answered'}
                                    </span>
                                    {isCorrect ? (
                                      <Check className="text-green-600 w-3 h-3 sm:w-4 sm:h-4" />
                                    ) : (
                                      <X className="text-red-600 w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                  </div>
                                  {!isCorrect && (
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      Correct answer: <span className="font-medium text-green-600">{q.options[q.answer]}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>

    {/* Add these styles to your global CSS or in a style tag */}
    <style jsx>{`
      @keyframes fade-in-out {
        0% { opacity: 0; transform: translateY(10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(10px); }
      }
      
      .animate-fade-in-out {
        animation: fade-in-out 2s ease-in-out;
      }
      
      @keyframes fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }

      /* Extra small breakpoint for better mobile handling */
      @media (min-width: 475px) {
        .xs\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `}</style>
  </div>
);
}