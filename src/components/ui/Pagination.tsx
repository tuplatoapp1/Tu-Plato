import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8 mb-4">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <span className="text-sm font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
