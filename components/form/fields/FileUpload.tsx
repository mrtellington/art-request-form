/**
 * File Upload Component
 *
 * Drag-and-drop file upload with progress tracking.
 * Full upload to Google Drive will be implemented in Phase 4.
 */

'use client';

import { FileAttachment } from '@/types/form';
import { Upload, X, File } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const newAttachments: FileAttachment[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      file,
      localUrl: URL.createObjectURL(file),
    }));

    onFilesChange([...files, ...newAttachments]);
  };

  const handleRemove = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.localUrl) {
      URL.revokeObjectURL(fileToRemove.localUrl);
    }
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          className="sr-only"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Upload className="h-10 w-10 text-zinc-400 mb-3" />
          <p className="text-sm font-medium text-zinc-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-zinc-500">PDF, PNG, JPG, or any file type</p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">
            Attached Files ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="p-1 hover:bg-zinc-100 rounded flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-zinc-500" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
