import { useState, useRef, useEffect } from "react";
import { Modal, Button, Radio, Progress, Tag, Input, Skeleton } from "antd";
import { CheckCircle, XCircle, BrainCircuit, MessageCircle, Send, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { useSubmitQuizMutation, useChatQuizMistakeMutation } from "../store/services/quizApi";
import ReactMarkdown from "react-markdown";

const QuizModal = ({ isOpen, onClose, quizData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    // Chat States
    const [chatQuestion, setChatQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizMutation();
    const [askTutor, { isLoading: isAsking }] = useChatQuizMistakeMutation();

    const chatEndRef = useRef(null);

    // Reset states when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setAnswers({});
            setResult(null);
            setChatHistory([]);
        }
    }, [isOpen, quizData]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleOptionChange = (e) => {
        setAnswers({ ...answers, [quizData.questions[currentStep].id]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const res = await submitQuiz({
                quizId: quizData.id,
                answers,
            }).unwrap();
            setResult(res);
        } catch (err) {
            console.error("Submit failed", err);
        }
    };

    const handleAskTutor = async () => {
        if (!chatQuestion.trim()) return;

        const userMsg = { role: "user", text: chatQuestion };
        setChatHistory((prev) => [...prev, userMsg]);
        setChatQuestion("");

        try {
            const res = await askTutor({
                quizId: quizData.id,
                question: userMsg.text
            }).unwrap();

            setChatHistory((prev) => [...prev, { role: "ai", text: res.answer }]);
        } catch (err) {
            setChatHistory((prev) => [...prev, { role: "ai", text: "⚠️ Error asking tutor." }]);
        }
    };

    if (!quizData) return null;

    const questions = quizData.questions || [];
    const currentQ = questions[currentStep];

    // --- RENDER: RESULT VIEW ---
    if (result) {
        const percentage = Math.round((result.score / result.total) * 100);

        return (
            <Modal
                open={isOpen}
                onCancel={onClose}
                footer={null}
                width={700}
                title={<div className="flex items-center gap-2 text-purple-700 font-bold text-lg"><BrainCircuit size={20} /> Active Recall Results</div>}
                styles={{ body: { padding: '20px' } }}
            >
                <div className="flex flex-col items-center justify-center mb-6 bg-purple-50 p-6 rounded-xl">
                    <Progress type="circle" percent={percentage} status={percentage >= 60 ? "success" : "exception"} strokeWidth={10} width={80} />
                    <h2 className="text-2xl font-bold mt-3 text-gray-800">You scored {result.score} / {result.total}</h2>
                    <p className="text-gray-500 text-sm">{percentage >= 80 ? "Excellent work! 🎉" : "Keep practicing! 💪"}</p>
                </div>

                {/* Question Review */}
                <div className="space-y-4 max-h-[250px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {result.data.questions.map((q, idx) => (
                        <div key={q.id} className={`p-4 rounded-lg border flex items-start gap-3 ${q.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                            <div className="mt-1">
                                {q.isCorrect ? <CheckCircle className="text-green-600" size={18} /> : <XCircle className="text-red-600" size={18} />}
                            </div>
                            <div className="w-full">
                                <p className="font-semibold text-gray-800 mb-1">{idx + 1}. {q.questionText}</p>
                                <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                                    <span className={q.isCorrect ? "text-green-700" : "text-red-600 font-medium"}>
                                        You: {q.userAnswer || "Skipped"}
                                    </span>
                                    {!q.isCorrect && (
                                        <span className="text-green-700 font-bold">Correct: {q.correctAnswer}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Tutor Chat Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                        <MessageCircle size={16} className="text-blue-600" />
                        <span className="font-semibold text-gray-700">Mistake Analysis Tutor</span>
                    </div>

                    <div className="h-48 overflow-y-auto p-4 bg-white space-y-3">
                        {chatHistory.length === 0 && (
                            <div className="text-center mt-12 text-gray-400">
                                <Sparkles className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Ask why you got a specific question wrong.</p>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2.5 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                                </div>
                            </div>
                        ))}
                        {isAsking && <div className="text-xs text-gray-400 animate-pulse ml-2">Tutor is analyzing...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 border-t flex gap-2 bg-gray-50">
                        <Input
                            placeholder="e.g. Why is option B incorrect for question 2?"
                            value={chatQuestion}
                            onChange={(e) => setChatQuestion(e.target.value)}
                            onPressEnter={handleAskTutor}
                            className="rounded-full"
                        />
                        <Button type="primary" shape="circle" icon={<Send size={14} />} onClick={handleAskTutor} loading={isAsking} className="bg-blue-600" />
                    </div>
                </div>
            </Modal>
        );
    }

    // --- RENDER: TAKING QUIZ ---
    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            title={
                <div className="flex justify-between items-center pr-8 py-2">
                    <span className="text-lg font-bold text-gray-800 truncate max-w-[300px]">{quizData.title}</span>
                    <Tag color="blue" className="rounded-full px-3">Q {currentStep + 1} / {questions.length}</Tag>
                </div>
            }
        >
            <div className="py-4">
                <h3 className="text-lg font-medium mb-6 text-gray-800 leading-relaxed">{currentQ?.questionText}</h3>

                <Radio.Group
                    onChange={handleOptionChange}
                    value={answers[currentQ?.id]}
                    className="flex flex-col gap-3 w-full"
                >
                    {currentQ?.options.map((opt, idx) => (
                        <Radio
                            key={idx}
                            value={opt}
                            className={`p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all ${answers[currentQ.id] === opt ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200'}`}
                        >
                            <span className="ml-2 text-gray-700">{opt}</span>
                        </Radio>
                    ))}
                </Radio.Group>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t">
                <Button
                    icon={<ChevronLeft size={16} />}
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="rounded-full px-6"
                >
                    Prev
                </Button>

                {currentStep === questions.length - 1 ? (
                    <Button
                        type="primary"
                        danger
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!answers[currentQ?.id]}
                        className="rounded-full px-8 font-semibold"
                    >
                        Submit Quiz
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        disabled={!answers[currentQ?.id]}
                        className="rounded-full px-6 bg-blue-600 flex items-center gap-1"
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default QuizModal;