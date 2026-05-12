import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Briefcase, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalTimeline } from "@/components/approval/ApprovalTimeline";
import { CommentSection } from "@/components/application/CommentSection";
import { ApprovalActions } from "@/components/application/ApprovalActions";
import { DocumentList } from "@/components/application/DocumentList";
import { ApplicationStatusBadge } from "@/components/application/ApplicationStatusBadge";
import type { ApprovalTimelineData } from "@/types";

type CommentType = {
  id: string;
  author: {
    name: string;
    role: 'student' | 'lecturer' | 'department' | 'registrar' | 'system';
    avatar?: string;
  };
  content: string;
  createdAt: string;
  attachments?: { name: string; url: string }[];
};

// Mock data - in production this would come from an API
const mockApplication = {
  id: "APP-2024-001",
  student: {
    id: "STU-001",
    name: "Nguyen Van A",
    email: "nguyenvana@student.edu.vn",
    phone: "+84 123 456 789",
    avatar: undefined,
    major: "Computer Science",
    year: "3rd Year",
  },
  position: {
    id: "POS-001",
    title: "Frontend Developer Intern",
    company: "TechCorp Vietnam",
    companyLogo: undefined,
    location: "Ho Chi Minh City",
    duration: "6 months",
    field: "Software Engineering",
  },
  status: "lecturer_review" as const,
  appliedDate: "2024-01-15",
  resume: {
    id: "DOC-001",
    name: "Nguyen_Van_A_Resume.pdf",
    type: "pdf",
    size: "245 KB",
    url: "#",
    uploadedAt: "2024-01-15",
    status: "verified" as const,
  },
  coverLetter: {
    id: "DOC-002",
    name: "Nguyen_Van_A_CoverLetter.pdf",
    type: "pdf",
    size: "120 KB",
    url: "#",
    uploadedAt: "2024-01-15",
    status: "pending" as const,
  },
  documents: [
    {
      id: "DOC-001",
      name: "Nguyen_Van_A_Resume.pdf",
      type: "pdf",
      size: "245 KB",
      url: "#",
      uploadedAt: "2024-01-15",
      status: "verified" as const,
    },
    {
      id: "DOC-002",
      name: "Nguyen_Van_A_CoverLetter.pdf",
      type: "pdf",
      size: "120 KB",
      url: "#",
      uploadedAt: "2024-01-15",
      status: "pending" as const,
    },
    {
      id: "DOC-003",
      name: "Transcripts_Semester_1_2_3.pdf",
      type: "pdf",
      size: "1.2 MB",
      url: "#",
      uploadedAt: "2024-01-15",
      status: "verified" as const,
    },
  ],
  timeline: {
    submittedAt: "January 15, 2024",
    steps: [
      {
        id: "submitted",
        title: "Application Submitted",
        description: "Your internship application has been submitted successfully.",
        status: "approved" as const,
        reviewer: "System",
        reviewedAt: "January 15, 2024",
        comment: "Application received and logged.",
      },
      {
        id: "department",
        title: "Department Approval",
        description: "Your department head is reviewing your application.",
        status: "approved" as const,
        reviewer: "Dr. Tran Thi B",
        reviewedAt: "January 18, 2024",
        comment: "Student meets academic requirements. Approved.",
      },
      {
        id: "lecturer",
        title: "Lecturer Approval",
        description: "Your assigned lecturer is reviewing your application.",
        status: "in_progress" as const,
        reviewer: undefined,
        reviewedAt: undefined,
        comment: undefined,
      },
      {
        id: "registrar",
        title: "Registrar Approval",
        description: "The registrar is giving final approval for your internship.",
        status: "pending" as const,
        reviewer: undefined,
        reviewedAt: undefined,
        comment: undefined,
      },
    ],
    isRejected: false,
  } as ApprovalTimelineData,
  comments: [
    {
      id: "CMT-001",
      author: {
        name: "Dr. Tran Thi B",
        role: "department" as const,
      },
      content: "I have reviewed this application. The student has completed all required courses and maintains a GPA of 3.5. I recommend approval.",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "CMT-002",
      author: {
        name: "Nguyen Van A",
        role: "student" as const,
      },
      content: "Thank you for the review. I have attached my updated transcripts for your reference.",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      attachments: [
        { name: "Updated_Transcripts.pdf", url: "#" },
      ],
    },
  ] as CommentType[],
};

const currentUser = {
  name: "Prof. Le Van C",
  avatar: undefined,
  role: "lecturer" as const,
};

export function ApplicationDetailPage() {
  useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentType[]>(mockApplication.comments as CommentType[]);
  const [isProcessing, setIsProcessing] = useState(false);

  const application = mockApplication; // In production, fetch by id

  const canApprove = currentUser.role === 'lecturer' && application.status === 'lecturer_review';

  const handleApprovalAction = async (action: 'approve' | 'reject' | 'request_changes', comment?: string) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add comment
    const newComment: CommentType = {
      id: `CMT-${Date.now()}`,
      author: {
        name: currentUser.name,
        role: currentUser.role,
      },
      content: comment || '',
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
    
    setIsProcessing(false);
    alert(`Application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned for changes'}`);
  };

  const handleAddComment = (content: string) => {
    const newComment: CommentType = {
      id: `CMT-${Date.now()}`,
      author: {
        name: currentUser.name,
        role: currentUser.role,
      },
      content,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[--color-background]">
      {/* Header */}
      <div className="bg-white border-b border-[--color-border]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Application Details</h1>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <p className="text-sm text-[--color-muted-foreground]">
                {application.id} • Applied on {application.appliedDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Approval Timeline */}
            <ApprovalTimeline data={application.timeline} />

            {/* Tabs for Details */}
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="position">Position Details</TabsTrigger>
                <TabsTrigger value="student">Student Info</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="mt-4">
                <DocumentList 
                  documents={application.documents}
                  title="Submitted Documents"
                />
              </TabsContent>

              <TabsContent value="position" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Position Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[--color-muted] font-bold text-[--color-muted-foreground]">
                        {application.position.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{application.position.title}</h3>
                        <p className="text-[--color-muted-foreground]">{application.position.company}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-[--color-muted-foreground]" />
                        <span>{application.position.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[--color-muted-foreground]" />
                        <span>{application.position.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-[--color-muted-foreground]" />
                        <span>{application.position.field}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="student" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[--color-muted] font-semibold text-[--color-muted-foreground]">
                        {application.student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{application.student.name}</h3>
                        <p className="text-[--color-muted-foreground]">{application.student.major} • {application.student.year}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-[--color-muted-foreground]" />
                        <a href={`mailto:${application.student.email}`} className="text-[--color-accent] hover:underline">
                          {application.student.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-[--color-muted-foreground]" />
                        <span>{application.student.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <CommentSection
              comments={comments}
              currentUser={currentUser}
              onSubmit={handleAddComment}
            />
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[--color-muted-foreground]">Application ID</span>
                  <span className="font-mono text-xs">{application.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[--color-muted-foreground]">Applied Date</span>
                  <span>{application.appliedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[--color-muted-foreground]">Current Stage</span>
                  <ApplicationStatusBadge status={application.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[--color-muted-foreground]">Documents</span>
                  <span>{application.documents.length} files</span>
                </div>
              </CardContent>
            </Card>

            {/* Approval Actions */}
            {canApprove && (
              <ApprovalActions
                currentStep="Lecturer Approval"
                canApprove={canApprove}
                onAction={handleApprovalAction}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
