"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Simple prev/next pager — the admin endpoints return a page of items, not a total count. */
export function PaginationControls({ page, hasMore, onPageChange, className }: PaginationControlsProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Précédent
      </Button>
      <span className="text-sm text-secondary">Page {page}</span>
      <Button size="sm" variant="secondary" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
        Suivant
      </Button>
    </div>
  );
}
