import { useState } from "react";
import { useGetNotesQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation, useGenerateSummaryMutation } from "../store/services/noteApi";
import { Button, Modal, Input, Form, Empty } from "antd";
import { Plus, Loader2 } from "lucide-react";
import NoteCard from "../components/NoteCard";
import { toast } from "react-hot-toast";

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // RTK Query Hooks
    const { data, isLoading } = useGetNotesQuery();
    const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();
    const [generateSummary] = useGenerateSummaryMutation(); // AI Summary

    // Handle Create Note
    const handleCreate = async (values) => {
        try {
            // Tags string to array conversion (comma separated)
            const formattedTags = values.tags
                ? values.tags.split(",").map(t => t.trim()).filter(t => t)
                : [];

            await createNote({ ...values, tags: formattedTags }).unwrap();
            toast.success("Note created successfully!");
            setIsModalOpen(false);
            form.resetFields();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to create note");
        }
    };

    // Handle Edit - Open Modal with Note Data
    const handleEdit = (note) => {
        setEditingNote(note);
        editForm.setFieldsValue({
            title: note.title,
            content: note.content,
            tags: note.tags?.map(t => t.name).join(", ") || "",
        });
        setIsEditModalOpen(true);
    };

    // Handle Update Note
    const handleUpdate = async (values) => {
        try {
            const formattedTags = values.tags
                ? values.tags.split(",").map(t => t.trim()).filter(t => t)
                : [];

            await updateNote({ id: editingNote.id, ...values, tags: formattedTags }).unwrap();
            toast.success("Note updated successfully!");
            setIsEditModalOpen(false);
            setEditingNote(null);
            editForm.resetFields();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update note");
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        try {
            await deleteNote(id).unwrap();
            toast.success("Note deleted");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete");
        }
    };

    // Handle AI Summary
    const handleSummary = async (id) => {
        const loadingToast = toast.loading("AI is thinking...");
        try {
            await generateSummary(id).unwrap();
            toast.success("Summary generated!", { id: loadingToast });
        } catch (err) {
            toast.error(err?.data?.message || "AI failed to summarize", { id: loadingToast });
        }
    };

    if (isLoading) {
        return <div className="flex h-64 justify-center items-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    const notes = data?.data || [];

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Notes 📝</h2>
                    <p className="text-gray-500">Manage your daily tasks and thoughts</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    size="large"
                    className="bg-blue-600"
                    onClick={() => setIsModalOpen(true)}
                >
                    Create Note
                </Button>
            </div>

            {/* Notes Grid */}
            {notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onSummarize={handleSummary}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Empty description="No notes found. Create your first one!" />
                </div>
            )}

            {/* Create Note Modal */}
            <Modal
                title="Create New Note"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
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
                        <Button type="primary" htmlType="submit" loading={isCreating} className="bg-blue-600">
                            Create Note
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit Note Modal */}
            <Modal
                title="Edit Note"
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingNote(null);
                    editForm.resetFields();
                }}
                footer={null}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
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
                        <Button onClick={() => {
                            setIsEditModalOpen(false);
                            setEditingNote(null);
                            editForm.resetFields();
                        }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isUpdating} className="bg-blue-600">
                            Update Note
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Dashboard;