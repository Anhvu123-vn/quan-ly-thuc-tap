import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface ProjectFormData {
  title: string;
  description: string;
  link: string;
  technologies: string;
  year: number;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string | number) => void;
  isEditing?: boolean;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  onChange,
  isEditing = false,
}: ProjectModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Sửa dự án" : "Thêm dự án mới"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <Input
                value={project.title}
                onChange={(e) => onChange("title", e.target.value)}
                placeholder="VD: Hệ thống quản lý thực tập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mô tả
              </label>
              <Textarea
                value={project.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="Mô tả ngắn về dự án..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link dự án
              </label>
              <Input
                value={project.link}
                onChange={(e) => onChange("link", e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Công nghệ sử dụng
              </label>
              <Input
                value={project.technologies}
                onChange={(e) => onChange("technologies", e.target.value)}
                placeholder="React, Node.js, PostgreSQL (cách nhau bởi dấu phẩy)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Năm thực hiện
              </label>
              <Input
                type="number"
                value={project.year}
                onChange={(e) => onChange("year", parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="2026"
                min={2000}
                max={2030}
                className="w-32"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={onSave}>
              {isEditing ? "Lưu thay đổi" : "Thêm dự án"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
