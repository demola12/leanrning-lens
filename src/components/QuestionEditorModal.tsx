"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import MathExtension from "@aarkue/tiptap-math-extension";
import { X, Image as ImageIcon, Bold, Italic, List, ListOrdered, Sigma } from "lucide-react";
import "katex/dist/katex.min.css";

interface QuestionEditorModalProps {
  title: string;
  onChangeTitle: (v: string) => void;
  imageUrl?: string;
  onUploadImage: (url: string) => void;
  onRemoveImage: () => void;
  userId: string;
  onClose: () => void;
}

function MathPopup({ onInsert, onClose }: { onInsert: (latex: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = `<math-field id="mathlive-field" style="width:100%;min-height:60px;font-size:16px;padding:8px;border:1px solid #e5e7eb;border-radius:8px;outline:none"></math-field>`;
    const mf = document.getElementById("mathlive-field") as any;
    if (mf) setTimeout(() => mf.focus(), 0);
  }, []);

  const handleInsert = () => {
    const mf = document.getElementById("mathlive-field") as any;
    onInsert(mf?.value || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/20 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium text-gray-700 mb-3">Write your math expression:</p>
        <div ref={ref} />
        <div className="flex items-center justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-1.5 rounded text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleInsert} className="px-4 py-1.5 rounded bg-primary text-white text-sm font-semibold hover:bg-primary-dark">Insert</button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionEditorModal({
  title,
  onChangeTitle,
  imageUrl,
  onUploadImage,
  onRemoveImage,
  userId,
  onClose,
}: QuestionEditorModalProps) {
  const [uploading, setUploading] = useState(false);
  const [showMathPopup, setShowMathPopup] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type your question here..." }),
      Image,
      MathExtension.configure({
        evaluation: false,
        katexOptions: { throwOnError: false },
      }),
    ],
    content: title,
    onUpdate: ({ editor }) => {
      onChangeTitle(editor.getHTML());
    },
  });

  const handleSave = () => {
    onChangeTitle(editor?.getHTML() || title);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("user_id", userId);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      onUploadImage(data.url);
      editor?.chain().focus().setImage({ src: data.url }).run();
    }
    setUploading(false);
  };

  const handleMathInsert = (latex: string) => {
    if (latex.trim()) {
      editor?.chain().focus().insertContentAt(editor.state.selection.from, {
        type: "inlineMath",
        attrs: { latex: latex.trim(), evaluate: "no", display: "no" },
      }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Edit Question</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50/50">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded ${editor.isActive("bold") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded ${editor.isActive("italic") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <Italic className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded ${editor.isActive("bulletList") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded ${editor.isActive("orderedList") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={() => setShowMathPopup(true)}
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
                title="Insert math with visual editor"
              >
                <Sigma className="w-4 h-4" />
              </button>
            </div>
            <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none" />
          </div>

          <div className="flex items-center gap-2 mt-3">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-all">
              <ImageIcon className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Add Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {imageUrl && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-600">
                <ImageIcon className="w-3.5 h-3.5" />Image added
                <button onClick={onRemoveImage} className="ml-1 text-emerald-500 hover:text-emerald-700">&times;</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">Save</button>
        </div>
      </div>

      {showMathPopup && (
        <MathPopup
          onInsert={handleMathInsert}
          onClose={() => setShowMathPopup(false)}
        />
      )}
    </div>
  );
}
