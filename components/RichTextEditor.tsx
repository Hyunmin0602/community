'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Quote,
    Code,
    Undo,
    Redo
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, readOnly = false }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || '내용을 입력하세요...',
            }),
        ],
        content: value,
        editable: !readOnly,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert max-w-none focus:outline-none ${readOnly ? '' : 'min-h-[200px] p-4'}`,
            },
        },
    });

    // readOnly 상태가 변경될 때 editor의 editable 상태 업데이트
    useEffect(() => {
        if (editor) {
            editor.setEditable(!readOnly);
        }
    }, [editor, readOnly]);

    // 외부 value가 변경되면 에디터 내용도 업데이트 (단, 에디터가 포커스된 상태가 아닐 때만 - 루프 방지)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // 현재 에디터 내용과 다를 때만 업데이트
            // 사용자가 타이핑 중일 때 커서 튐 방지를 위해 포커스 체크가 필요할 수 있으나,
            // 여기서는 'Generate' 버튼 클릭 시 전체 교체를 의도하므로 강제 설정
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`${readOnly ? '' : 'border rounded-lg overflow-hidden bg-background'}`}>
            {/* Toolbar - readOnly가 아닐 때만 표시 */}
            {!readOnly && (
                <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('bold') ? 'bg-muted' : ''
                            }`}
                        title="굵게"
                    >
                        <Bold className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('italic') ? 'bg-muted' : ''
                            }`}
                        title="기울임"
                    >
                        <Italic className="h-4 w-4" />
                    </button>
                    <div className="w-px bg-border mx-1" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''
                            }`}
                        title="제목"
                    >
                        <Heading2 className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted' : ''
                            }`}
                        title="목록"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted' : ''
                            }`}
                        title="번호 목록"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('blockquote') ? 'bg-muted' : ''
                            }`}
                        title="인용"
                    >
                        <Quote className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={`p-2 rounded hover:bg-muted ${editor.isActive('codeBlock') ? 'bg-muted' : ''
                            }`}
                        title="코드"
                    >
                        <Code className="h-4 w-4" />
                    </button>
                    <div className="w-px bg-border mx-1" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-2 rounded hover:bg-muted disabled:opacity-50"
                        title="실행 취소"
                    >
                        <Undo className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-2 rounded hover:bg-muted disabled:opacity-50"
                        title="다시 실행"
                    >
                        <Redo className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
