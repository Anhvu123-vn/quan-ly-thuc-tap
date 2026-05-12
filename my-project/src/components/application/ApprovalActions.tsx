import { useState } from "react";
import { Check, X, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ActionType = 'approve' | 'reject' | 'request_changes';

interface ApprovalActionsProps {
  currentStep: string;
  canApprove: boolean;
  onAction: (action: ActionType, comment?: string) => void;
  isProcessing?: boolean;
}

export function ApprovalActions({ 
  currentStep, 
  canApprove, 
  onAction, 
  isProcessing 
}: ApprovalActionsProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    onAction('approve', comment);
    setComment('');
  };

  const handleReject = () => {
    if (!comment.trim()) return;
    onAction('reject', comment);
    setShowRejectForm(false);
    setComment('');
  };

  const handleRequestChanges = () => {
    if (!comment.trim()) return;
    onAction('request_changes', comment);
    setShowChangesForm(false);
    setComment('');
  };

  const cancelForms = () => {
    setShowRejectForm(false);
    setShowChangesForm(false);
    setComment('');
  };

  if (!canApprove) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-[--color-muted-foreground]">
          <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>You don't have permission to review at this stage.</p>
          <p className="mt-1">Current stage: <span className="font-medium text-[--color-foreground]">{currentStep}</span></p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Review Actions</CardTitle>
        <CardDescription>
          Review this application and provide your decision
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main action buttons */}
        {!showRejectForm && !showChangesForm && (
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleApprove} 
              disabled={isProcessing}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowChangesForm(true)}
              disabled={isProcessing}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Request Changes
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {/* Reject form */}
        {showRejectForm && (
          <RejectForm 
            comment={comment}
            onCommentChange={setComment}
            onConfirm={handleReject}
            onCancel={cancelForms}
            isProcessing={isProcessing}
          />
        )}

        {/* Request changes form */}
        {showChangesForm && (
          <RequestChangesForm
            comment={comment}
            onCommentChange={setComment}
            onConfirm={handleRequestChanges}
            onCancel={cancelForms}
            isProcessing={isProcessing}
          />
        )}
      </CardContent>
    </Card>
  );
}

function RejectForm({
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  comment: string;
  onCommentChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 text-red-800">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Reject Application</span>
      </div>
      <p className="text-sm text-red-700">
        Please provide a reason for rejection. This will be shared with the student.
      </p>
      <Textarea
        placeholder="Reason for rejection (required)..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="min-h-[100px] bg-white"
      />
      <div className="flex gap-2">
        <Button 
          variant="destructive" 
          onClick={onConfirm}
          disabled={!comment.trim() || isProcessing}
        >
          {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function RequestChangesForm({
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  comment: string;
  onCommentChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-800">
        <MessageSquare className="h-5 w-5" />
        <span className="font-medium">Request Changes</span>
      </div>
      <p className="text-sm text-amber-700">
        Please specify what changes or additional information are needed.
      </p>
      <Textarea
        placeholder="Required changes or additional information (required)..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="min-h-[100px] bg-white"
      />
      <div className="flex gap-2">
        <Button 
          variant="default"
          onClick={onConfirm}
          disabled={!comment.trim() || isProcessing}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isProcessing ? 'Sending...' : 'Send Request'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Compact version for lists
export function ApprovalActionsCompact({
  onAction,
}: {
  onAction: (action: ActionType) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        onClick={() => onAction('approve')}
        className="gap-1 bg-green-600 hover:bg-green-700"
      >
        <Check className="h-3 w-3" />
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => onAction('reject')}
        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <X className="h-3 w-3" />
        Reject
      </Button>
    </div>
  );
}
