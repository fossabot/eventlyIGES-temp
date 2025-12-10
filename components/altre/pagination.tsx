// components/altre/pagination.tsx
"use client";

import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

interface ClientPaginationProps {
  totalPages: number;
  page: number;
  setPage: (newPage: number) => void;
}

const ClientPagination: React.FC<ClientPaginationProps> = ({ totalPages, page, setPage }) => {
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        className={`p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition ${
          page <= 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={page <= 1}
        onClick={() => handlePageChange(page - 1)}
      >
        <BiChevronLeft size={24} />
      </button>

      <span className="text-lg font-semibold">
        {page} / {totalPages}
      </span>

      <button
        className={`p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition ${
          page >= totalPages ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={page >= totalPages}
        onClick={() => handlePageChange(page + 1)}
      >
        <BiChevronRight size={24} />
      </button>
    </div>
  );
};

export default ClientPagination;
