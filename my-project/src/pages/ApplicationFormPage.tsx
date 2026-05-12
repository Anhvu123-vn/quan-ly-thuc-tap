import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, X, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Position } from "@/types";

interface ApplicationFormPageProps {
  position?: Position;
}

interface DocumentFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: string;
}

export function ApplicationFormPage({ position }: ApplicationFormPageProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [coverLetter, setCoverLetter] = useState("");
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [linkedIn, setLinkedIn] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Drag and drop state
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileAdd(e.dataTransfer.files[0]);
    }
  };

  const handleFileAdd = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    
    const newDoc: DocumentFile = {
      id: `DOC-${Date.now()}`,
      file,
      name: file.name,
      type: file.type.split('/')[1] || 'file',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    };
    
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileAdd(e.target.files[0]);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (documents.length === 0) {
      alert("Please upload at least your resume");
      return;
    }

    if (!coverLetter.trim()) {
      alert("Please write a cover letter");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const canProceedToStep2 = documents.length > 0;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[--color-background]">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold">Application Submitted!</h1>
            <p className="mt-2 text-[--color-muted-foreground]">
              Your application for <span className="font-medium text-[--color-foreground]">{position?.title}</span> at <span className="font-medium text-[--color-foreground]">{position?.company}</span> has been submitted successfully.
            </p>
            <p className="mt-1 text-sm text-[--color-muted-foreground]">
              You will receive an email notification once the review process begins.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/positions')}>
                Browse More Positions
              </Button>
              <Button onClick={() => navigate('/student')}>
                View My Applications
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-background]">
      {/* Header */}
      <div className="bg-white border-b border-[--color-border]">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Position info */}
        {position && (
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[--color-muted] font-bold text-[--color-muted-foreground]">
                {position.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold">{position.title}</h2>
                <p className="text-sm text-[--color-muted-foreground]">{position.company}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator 
              step={1} 
              currentStep={step} 
              label="Documents" 
              onClick={() => setStep(1)}
            />
            <div className={cn(
              "h-px w-16",
              step >= 2 ? "bg-[--color-accent]" : "bg-[--color-border]"
            )} />
            <StepIndicator 
              step={2} 
              currentStep={step} 
              label="Cover Letter" 
              onClick={() => step >= 2 && setStep(2)}
              disabled={!canProceedToStep2}
            />
            <div className={cn(
              "h-px w-16",
              step >= 3 ? "bg-[--color-accent]" : "bg-[--color-border]"
            )} />
            <StepIndicator 
              step={3} 
              currentStep={step} 
              label="Additional Info" 
              onClick={() => step >= 3 && setStep(3)}
              disabled={!canProceedToStep2}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Documents */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload your resume and other required documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume upload - required */}
                <div>
                  <Label className="flex items-center gap-2">
                    Resume <span className="text-[--color-destructive]">*</span>
                  </Label>
                  <div
                    className={cn(
                      "mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                      isDragActive 
                        ? "border-[--color-accent] bg-[--color-muted]" 
                        : "border-[--color-border] hover:border-[--color-muted-foreground]"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <Upload className="mx-auto h-10 w-10 text-[--color-muted-foreground]" />
                    <p className="mt-2 text-sm text-[--color-muted-foreground]">
                      Drag and drop your resume here, or{' '}
                      <span className="text-[--color-accent] hover:underline">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-[--color-muted-foreground]">
                      PDF, DOC, or DOCX (max 5MB)
                    </p>
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInput}
                    />
                  </div>
                </div>

                {/* Additional documents */}
                <div>
                  <Label>Additional Documents (Optional)</Label>
                  <p className="text-sm text-[--color-muted-foreground] mb-2">
                    Upload transcripts, certificates, or portfolio samples
                  </p>
                  <div
                    className={cn(
                      "border-2 border-dashed border-[--color-border] rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-[--color-muted-foreground]",
                      isDragActive && "border-[--color-accent] bg-[--color-muted]"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('additional-upload')?.click()}
                  >
                    <Plus className="mx-auto h-8 w-8 text-[--color-muted-foreground]" />
                    <p className="mt-2 text-sm text-[--color-muted-foreground]">
                      Add more documents
                    </p>
                    <input
                      id="additional-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      multiple
                      onChange={handleFileInput}
                    />
                  </div>
                </div>

                {/* Uploaded documents list */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents</Label>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-[--color-border] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[--color-muted-foreground]" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-[--color-muted-foreground]">{doc.size}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Cover Letter */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
                <CardDescription>
                  Write a compelling cover letter to stand out
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="coverLetter">
                    Cover Letter <span className="text-[--color-destructive]">*</span>
                  </Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Introduce yourself and explain why you're interested in this position. Highlight relevant skills and experiences..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="mt-2 min-h-[200px]"
                  />
                  <p className="mt-2 text-xs text-[--color-muted-foreground]">
                    {coverLetter.length} characters (recommended: 300-500 words)
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!coverLetter.trim()}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Additional Info */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Provide links to your professional profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                  <Input
                    id="linkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio / Website</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://your-portfolio.com"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Summary */}
                <div className="rounded-lg border border-[--color-border] bg-[--color-muted] p-4">
                  <h4 className="font-medium">Application Summary</h4>
                  <ul className="mt-2 space-y-1 text-sm text-[--color-muted-foreground]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {documents.length} document(s) uploaded
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Cover letter: {coverLetter.length} characters
                    </li>
                    {linkedIn && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        LinkedIn profile provided
                      </li>
                    )}
                    {portfolio && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Portfolio provided
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}

function StepIndicator({ 
  step, 
  currentStep, 
  label, 
  onClick,
  disabled 
}: { 
  step: number; 
  currentStep: number; 
  label: string; 
  onClick: () => void;
  disabled?: boolean;
}) {
  const isCompleted = currentStep > step;
  const isCurrent = currentStep === step;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-1",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
          isCompleted && "bg-green-600 text-white",
          isCurrent && "bg-[--color-accent] text-white",
          !isCompleted && !isCurrent && "border-2 border-[--color-border] bg-white text-[--color-muted-foreground]"
        )}
      >
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={cn(
        "text-xs",
        isCurrent && "font-medium text-[--color-foreground]",
        !isCurrent && "text-[--color-muted-foreground]"
      )}>
        {label}
      </span>
    </button>
  );
}
