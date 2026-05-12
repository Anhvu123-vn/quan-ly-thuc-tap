import { useState } from "react";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Position } from "@/types";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
  onSubmit?: (data: ApplicationData) => void;
}

export interface ApplicationData {
  coverLetter: string;
  resume: File | null;
  linkedIn?: string;
  portfolio?: string;
}

export function ApplyModal({ isOpen, onClose, position, onSubmit }: ApplyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    coverLetter: '',
    resume: null,
    linkedIn: '',
    portfolio: '',
  });
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFormData({ ...formData, resume: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    onSubmit?.(formData);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ coverLetter: '', resume: null, linkedIn: '', portfolio: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-[--color-border] bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Apply for this position</h2>
            <p className="text-sm text-[--color-muted-foreground]">{position.title} at {position.company}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Application Submitted!</h3>
            <p className="mt-2 text-[--color-muted-foreground]">
              Thank you for applying. The company will review your application and get back to you soon.
            </p>
            <Button className="mt-6" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Resume upload */}
            <div>
              <Label htmlFor="resume">Resume *</Label>
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-[--color-accent] bg-[--color-muted]' 
                    : 'border-[--color-border] hover:border-[--color-muted-foreground]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.resume ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-[--color-muted-foreground]" />
                    <div className="text-left">
                      <p className="font-medium">{formData.resume.name}</p>
                      <p className="text-sm text-[--color-muted-foreground]">
                        {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setFormData({ ...formData, resume: null })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-[--color-muted-foreground]" />
                    <p className="mt-2 text-sm text-[--color-muted-foreground]">
                      Drag and drop your resume here, or{' '}
                      <label className="cursor-pointer text-[--color-accent] hover:underline">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                      </label>
                    </p>
                    <p className="mt-1 text-xs text-[--color-muted-foreground]">
                      PDF, DOC, or DOCX (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Cover letter */}
            <div>
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                className="mt-2 min-h-[120px]"
                required
              />
            </div>

            {/* LinkedIn */}
            <div>
              <Label htmlFor="linkedIn">LinkedIn Profile</Label>
              <Input
                id="linkedIn"
                type="url"
                placeholder="https://linkedin.com/in/your-profile"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Portfolio */}
            <div>
              <Label htmlFor="portfolio">Portfolio / Website</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://your-portfolio.com"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.resume || !formData.coverLetter}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
