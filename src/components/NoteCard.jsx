import { Button, Tag, Popconfirm } from "antd";
import { Trash2, Edit, Sparkles } from "lucide-react";

const NoteCard = ({ note, onDelete, onEdit, onSummarize }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col justify-between h-full">
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
                        <Tag key={tag.id} color="blue" className="mr-0">
                            #{tag.name}
                        </Tag>
                    ))}
                </div>

                {/* AI Summary Section (Optional Display) */}
                {note.aiSummary && (
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-4 border border-gray-200">
                        <strong>AI Summary:</strong> {note.aiSummary}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                    size="small"
                    icon={<Sparkles size={14} />}
                    onClick={() => onSummarize(note.id)}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    title="Generate AI Summary"
                />
                <Button
                    size="small"
                    icon={<Edit size={14} />}
                    onClick={() => onEdit(note)}
                />
                <Popconfirm
                    title="Delete the note"
                    description="Are you sure to delete this note?"
                    onConfirm={() => onDelete(note.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
            </div>
        </div>
    );
};

export default NoteCard;