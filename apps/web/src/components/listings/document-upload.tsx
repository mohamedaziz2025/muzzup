"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { useAnalyzeListingDocument } from "@/lib/hooks/use-listing-documents";
import { ApiError } from "@/lib/api-client";

const ACCEPTED_EXTENSIONS = ".pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.webp";
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

export type DocStatus = "uploading" | "clear" | "flagged" | "rejected" | "error";

export interface UploadedDoc {
  id: string;
  fileName: string;
  status: DocStatus;
  message?: string;
}

interface DocumentUploadProps {
  /** Resolves to a persisted listing id, creating the draft first if needed (like the AI estimate button). */
  ensureListingId: () => Promise<string>;
  onDocsChange?: (docs: UploadedDoc[]) => void;
}

/** Drag-and-drop document/screenshot upload for the seller wizard, gated by an AI halal pre-check. */
export function DocumentUpload({ ensureListingId, onDocsChange }: DocumentUploadProps) {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const analyze = useAnalyzeListingDocument();

  function updateDocs(updater: (prev: UploadedDoc[]) => UploadedDoc[]) {
    setDocs((prev) => {
      const next = updater(prev);
      onDocsChange?.(next);
      return next;
    });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    for (const file of Array.from(fileList)) {
      const id = crypto.randomUUID();

      if (file.size > MAX_SIZE_BYTES) {
        updateDocs((prev) => [
          ...prev,
          { id, fileName: file.name, status: "error", message: "Fichier trop volumineux (15 Mo max)" },
        ]);
        continue;
      }

      updateDocs((prev) => [...prev, { id, fileName: file.name, status: "uploading" }]);
      try {
        const listingId = await ensureListingId();
        const result = await analyze.mutateAsync({ listingId, file });
        updateDocs((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: result.verdict, message: result.summary } : d)),
        );
      } catch (err) {
        const isRejection = err instanceof ApiError && err.code === "UNPROCESSABLE_ENTITY";
        const message =
          err instanceof ApiError ? err.message : "Échec de l'analyse du document, réessayez.";
        updateDocs((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: isRejection ? "rejected" : "error", message } : d)),
        );
      }
    }
  }

  function removeDoc(id: string) {
    updateDocs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging ? "border-cyan bg-cyan/5" : "border-[var(--border-subtle)] hover:border-royal/40"
        }`}
      >
        <Upload className="size-6 text-muted" strokeWidth={1.6} />
        <p className="text-sm text-secondary">
          Glissez vos fichiers ici ou <span className="text-cyan underline">parcourez</span>
        </p>
        <p className="text-xs text-muted">
          PDF, CSV, Excel, captures d&apos;écran — 15 Mo max par fichier
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-xs text-muted">
        Chaque document est analysé par IA avant d&apos;être ajouté à votre data room, pour vérifier
        l&apos;absence de contenu non conforme à la charia. Cette pré-analyse assiste l&apos;auditeur
        humain, elle ne le remplace pas.
      </p>

      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.id} className="glass flex items-start gap-3 rounded-[var(--radius-md)] p-3">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-primary">{doc.fileName}</p>
                {doc.message && <p className="mt-0.5 text-xs text-secondary">{doc.message}</p>}
              </div>
              <StatusBadge status={doc.status} />
              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                className="text-muted transition-colors hover:text-danger"
                aria-label="Retirer"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DocStatus }) {
  switch (status) {
    case "uploading":
      return <Loader2 className="size-4 shrink-0 animate-spin text-cyan" aria-label="Analyse en cours" />;
    case "clear":
      return <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Conforme" />;
    case "flagged":
      return <AlertTriangle className="size-4 shrink-0 text-warning" aria-label="À vérifier" />;
    case "rejected":
    case "error":
      return <XCircle className="size-4 shrink-0 text-danger" aria-label="Rejeté" />;
  }
}
