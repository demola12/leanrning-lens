"use client";

import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
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

const FormulaEmbed = {
  blotName: "formula",
  className: "ql-formula",
  tagName: "SPAN",
};

export default function QuestionEditorModal({
  title,
  onChangeTitle,
  imageUrl,
  onUploadImage,
  onRemoveImage,
  userId,
  onClose,
}: QuestionEditorModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState(title);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      import("quill/dist/quill.snow.css");
      import("quill").then((mod) => {
        const Quill = mod.default;
        Quill.register("blots/formula", FormulaEmbed, true);
        const quill = new Quill(editorRef.current!, {
          theme: "snow",
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["formula"],
            ],
          },
          placeholder: "Type your question here...",
        });
        const delta = quill.clipboard.convert({ html: title });
        quill.setContents(delta, "silent");
        quillRef.current = quill;
        setLoaded(true);
        quill.on("text-change", () => {
          setContent(quill.root.innerHTML);
        });
      });
    }
    return () => {
      quillRef.current = null;
    };
  }, []);

  const handleSave = () => {
    onChangeTitle(quillRef.current?.root.innerHTML || content);
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
      const range = quillRef.current?.getSelection(true);
      quillRef.current?.clipboard.dangerouslyPasteHTML(range?.index || 0, `<img src="${data.url}" />`);
    }
    setUploading(false);
  };

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
          <div ref={editorRef} style={{ minHeight: "250px" }} />
          {!loaded && (
            <div className="p-8 text-center text-sm text-gray-400">Loading editor...</div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-all">
              <ImageIcon className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Add Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {imageUrl && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-600">
                <ImageIcon className="w-3.5 h-3.5" />
                Image added
                <button onClick={onRemoveImage} className="ml-1 text-emerald-500 hover:text-emerald-700">&times;</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
