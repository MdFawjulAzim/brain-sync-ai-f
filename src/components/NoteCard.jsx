import { Button, Tag, Popconfirm, Tooltip } from "antd";
import { Trash2, Edit, Sparkles, BrainCircuit, Loader2 } from "lucide-react";

const NoteCard = ({ note, onDelete, onEdit, onSummarize, onTakeQuiz, isGeneratingQuiz }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                        {note.title}
                    </h3>
                    {/* AI Badge if summary exists */}
                    {note.aiSummary && (
                        <div className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                            <Sparkles size={10} /> AI Ready
                        </div>
                    )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags?.map((tag) => (
                        <Tag key={tag.id} color="blue" className="mr-0 rounded-full px-2">
                            #{tag.name}
                        </Tag>
                    ))}
                </div>

                {/* AI Summary Section (Optional Display) */}
                {note.aiSummary && (
                    <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 mb-4 border border-gray-200 italic">
                        <strong>✨ AI Summary:</strong> {note.aiSummary}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-2">

                {/* 🎯 QUIZ BUTTON (New) */}
                <Tooltip title="Generate a Quiz from this note">
                    <Button
                        size="small"
                        icon={isGeneratingQuiz ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
                        onClick={() => onTakeQuiz(note.id)}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 flex items-center gap-1"
                        disabled={isGeneratingQuiz}
                    >
                        {isGeneratingQuiz ? "Creating..." : "Quiz"}
                    </Button>
                </Tooltip>

                <Tooltip title="Generate Summary">
                    <Button
                        size="small"
                        icon={<Sparkles size={14} />}
                        onClick={() => onSummarize(note.id)}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                    />
                </Tooltip>

                <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>

                <Button
                    size="small"
                    icon={<Edit size={14} />}
                    onClick={() => onEdit(note)}
                    className="text-gray-600 hover:text-blue-600 hover:border-blue-300"
                />

                <Popconfirm
                    title="Delete the note"
                    description="Are you sure to delete this note?"
                    onConfirm={() => onDelete(note.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button size="small" danger icon={<Trash2 size={14} />} className="hover:bg-red-50" />
                </Popconfirm>
            </div>
        </div>
    );
};

export default NoteCard;