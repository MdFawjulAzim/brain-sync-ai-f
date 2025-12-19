import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    useGetNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useGenerateSummaryMutation,
    noteApi
} from "../store/services/noteApi";
// 👇 Import Quiz API Hook
import { useGenerateQuizMutation } from "../store/services/quizApi";

import { Button, Modal, Input, Form, Empty, Pagination } from "antd";
import { Plus, Loader2 } from "lucide-react";
import NoteCard from "../components/NoteCard";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import AIChatButton from "../components/AIChatButton";
import QuizModal from "../components/QuizModal"; // 👇 Import Quiz Modal

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "http://localhost:5000";

const Dashboard = () => {
    const dispatch = useDispatch();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Note Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [form] = Form.useForm();

    // Quiz States
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [activeQuizData, setActiveQuizData] = useState(null);
    const [generatingNoteId, setGeneratingNoteId] = useState(null);

    // API Hooks
    const { data, isLoading } = useGetNotesQuery({ page, limit });
    const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();
    const [generateSummary] = useGenerateSummaryMutation();
    const [generateQuiz] = useGenerateQuizMutation(); // 👇 Quiz Mutation

    useEffect(() => {
        const socket = io(SOCKET_URL);
        socket.on("connect", () => console.log("🟢 Connected to Socket"));

        const handleRealtimeUpdate = (message) => {
            dispatch(noteApi.util.invalidateTags(["Notes"]));
            toast.success(message, { icon: '🔔' });
        };

        socket.on("new-note", () => handleRealtimeUpdate("New note added!"));
        socket.on("note-updated", () => handleRealtimeUpdate("Note updated!"));
        socket.on("note-deleted", () => handleRealtimeUpdate("Note deleted!"));

        return () => socket.disconnect();
    }, [dispatch]);

    // Note Modal Handlers
    const openModal = (note = null) => {
        setEditingNote(note);
        setIsModalOpen(true);
        if (note) {
            const tagString = note.tags?.map(t => t.name).join(", ");
            form.setFieldsValue({ ...note, tags: tagString });
        } else {
            form.resetFields();
        }
    };

    const handleSubmit = async (values) => {
        try {
            const formattedTags = values.tags
                ? values.tags.split(",").map(t => t.trim()).filter(t => t)
                : [];
            const payload = { ...values, tags: formattedTags };

            if (editingNote) {
                await updateNote({ id: editingNote.id, ...payload }).unwrap();
                toast.success("Note updated!");
            } else {
                await createNote(payload).unwrap();
                toast.success("Note created!");
                setPage(1);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingNote(null);
        } catch (err) {
            toast.error("Operation failed! " + (err?.data?.message || ""));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNote(id).unwrap();
            toast.success("Note deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const handleSummary = async (id) => {
        const loadingToast = toast.loading("AI is summarizing...");
        try {
            await generateSummary(id).unwrap();
            toast.success("Summary generated!", { id: loadingToast });
        } catch (err) {
            toast.error("AI failed", { id: loadingToast });
        }
    };

    // 👇 Quiz Handler
    const handleTakeQuiz = async (noteId) => {
        setGeneratingNoteId(noteId);
        const loadingToast = toast.loading("AI is crafting your quiz...");

        try {
            const res = await generateQuiz({ noteId }).unwrap();
            setActiveQuizData(res.data);
            setIsQuizModalOpen(true);
            toast.success("Quiz Ready! Good luck 🍀", { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate quiz.", { id: loadingToast });
        } finally {
            setGeneratingNoteId(null);
        }
    };

    if (isLoading) {
        return <div className="flex h-64 justify-center items-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }

    const notes = data?.data || [];
    const totalNotes = data?.total || 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Notes 📝</h2>
                    <p className="text-gray-500">Total Notes: {totalNotes}</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700 shadow-md"
                    onClick={() => openModal(null)}
                >
                    Create Note
                </Button>
            </div>

            {notes.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onDelete={handleDelete}
                                onEdit={() => openModal(note)}
                                onSummarize={handleSummary}

                                // 👇 Quiz Props
                                onTakeQuiz={handleTakeQuiz}
                                isGeneratingQuiz={generatingNoteId === note.id}
                            />
                        ))}
                    </div>

                    <div className="flex justify-center pb-8">
                        <Pagination
                            current={page}
                            total={totalNotes}
                            pageSize={limit}
                            onChange={(p, l) => {
                                setPage(p);
                                setLimit(l);
                            }}
                            showSizeChanger
                            pageSizeOptions={['5', '10', '20']}
                            showTotal={(total) => `Total ${total} items`}
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col justify-center items-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Empty description={false} />
                    <p className="text-gray-500 mt-2">No notes found. Create your first one!</p>
                </div>
            )}

            {/* Note Create/Edit Modal */}
            <Modal
                title={editingNote ? "Edit Note" : "Create New Note"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingNote(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input placeholder="Enter note title" />
                    </Form.Item>
                    <Form.Item name="content" label="Content" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="Write your thoughts..." />
                    </Form.Item>
                    <Form.Item name="tags" label="Tags (Comma separated)">
                        <Input placeholder="work, urgent, idea" />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} className="bg-blue-600">
                            {editingNote ? "Update Note" : "Create Note"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* 👇 Quiz Modal */}
            <QuizModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                quizData={activeQuizData}
            />

            {/* AI Chat Button */}
            <AIChatButton />
        </div>
    );
};

export default Dashboard;