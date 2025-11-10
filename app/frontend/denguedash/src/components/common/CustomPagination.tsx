import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@shadcn/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export default function CustomPagination({
  currentPage,
  totalPages,
  handlePageChange,
}: CustomPaginationProps) {
  return totalPages > 1 ? (
    <div className="mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
              size="default"
            />
          </PaginationItem>

          {(() => {
            const pageNumbers = [];
            if (totalPages <= 5) {
              // If there are 5 or fewer pages, show all
              for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
              }
            } else {
              // Always show first page
              pageNumbers.push(1);

              if (currentPage > 3) {
                pageNumbers.push(null); // null represents ellipsis
              }

              // Show current page and one or two surrounding pages
              for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
              ) {
                pageNumbers.push(i);
              }

              if (currentPage < totalPages - 2) {
                pageNumbers.push(null); // null represents ellipsis
              }

              // Always show last page
              pageNumbers.push(totalPages);
            }

            return pageNumbers.map((page, index) =>
              page === null ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    size="default"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            );
          })()}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ) : null;
}
