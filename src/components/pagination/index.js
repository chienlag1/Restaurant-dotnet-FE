import React, { useState } from "react";

const Pagination = ({ totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 px-4 py-2 rounded ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 border border-blue-500"
          } hover:bg-blue-500 hover:text-white transition duration-300`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mx-1 px-4 py-2 rounded bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {renderPaginationButtons()}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="mx-1 px-4 py-2 rounded bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
