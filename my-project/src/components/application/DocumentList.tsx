import { FileText, Download, Eye, File, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedAt: string;
  status?: 'pending' | 'verified' | 'rejected';
}

interface DocumentListProps {
  documents: Document[];
  title?: string;
  onPreview?: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
}

const fileTypeIcons: Record<string, typeof File> = {
  pdf: FileText,
  doc: File,
  docx: File,
  xls: File,
  xlsx: File,
  png: File,
  jpg: File,
  jpeg: File,
};

function getFileIcon(type: string) {
  const ext = type.toLowerCase().split('.').pop() || '';
  return fileTypeIcons[ext] || File;
}

function getFileIconColor(type: string) {
  const ext = type.toLowerCase().split('.').pop() || '';
  switch (ext) {
    case 'pdf':
      return 'text-red-500 bg-red-50';
    case 'doc':
    case 'docx':
      return 'text-blue-500 bg-blue-50';
    case 'xls':
    case 'xlsx':
      return 'text-green-500 bg-green-50';
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'text-purple-500 bg-purple-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
}

export function DocumentList({ documents, title = "Documents", onPreview, onDownload }: DocumentListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-sm text-[--color-muted-foreground]">
            {documents.length} file{documents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <File className="mx-auto h-10 w-10 text-[--color-muted-foreground] opacity-50" />
            <p className="mt-2 text-sm text-[--color-muted-foreground]">No documents uploaded</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => {
              const Icon = getFileIcon(doc.type);
              const iconColor = getFileIconColor(doc.type);

              return (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[--color-border] hover:bg-[--color-muted] transition-colors"
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconColor)}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[--color-muted-foreground]">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadedAt}</span>
                      {doc.status && (
                        <>
                          <span>•</span>
                          <DocumentStatusBadge status={doc.status} />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onPreview && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onPreview(doc)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onDownload && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDownload(doc)}
                        className="h-8 w-8"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DocumentStatusBadge({ status }: { status: Document['status'] }) {
  const config = {
    pending: { label: 'Pending Review', className: 'bg-amber-50 text-amber-700' },
    verified: { label: 'Verified', className: 'bg-green-50 text-green-700' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700' },
  };

  const { label, className } = config[status!];

  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium", className)}>
      {status === 'verified' && <FileCheck className="h-3 w-3" />}
      {label}
    </span>
  );
}

// Compact version for inline display
export function DocumentBadge({ document }: { document: Document }) {
  const Icon = getFileIcon(document.type);

  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-[--color-border] text-xs hover:bg-[--color-muted] transition-colors"
    >
      <Icon className="h-3.5 w-3.5 text-[--color-muted-foreground]" />
      <span className="truncate max-w-[150px]">{document.name}</span>
    </a>
  );
}
