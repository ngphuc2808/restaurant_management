"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@repo/ui/components/pagination";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

type Props = {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  pageSize: number;
};

const RANGE = 1;

const AutoPagination = ({
  page,
  setPage,
  limit,
  setLimit,
  pageSize,
}: Props) => {
  const tAll = useTranslations("All");

  const isMobile = useIsMobile();

  const renderPagination = () => {
    let dotAfter = false;
    let dotBefore = false;

    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true;
        return (
          <PaginationItem key={`dot-before-${index}`}>
            <PaginationEllipsis title={tAll("more_pages")} />
          </PaginationItem>
        );
      }
      return null;
    };

    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true;
        return (
          <PaginationItem key={`dot-after-${index}`}>
            <PaginationEllipsis title={tAll("more_pages")} />
          </PaginationItem>
        );
      }
      return null;
    };

    return Array.from({ length: pageSize }).map((_, index) => {
      const pageNumber = index;

      if (
        page <= RANGE * 2 + 1 &&
        pageNumber > page + RANGE &&
        pageNumber < pageSize - RANGE + 1
      ) {
        return renderDotAfter(index);
      } else if (page > RANGE * 2 + 1 && page < pageSize - RANGE * 2) {
        if (pageNumber < page - RANGE && pageNumber > RANGE) {
          return renderDotBefore(index);
        } else if (
          pageNumber > page + RANGE &&
          pageNumber < pageSize - RANGE + 1
        ) {
          return renderDotAfter(index);
        }
      } else if (
        page >= pageSize - RANGE * 2 &&
        pageNumber > RANGE &&
        pageNumber < page - RANGE
      ) {
        return renderDotBefore(index);
      }

      return (
        <PaginationItem key={`page-${pageNumber}`}>
          <Button
            onClick={() => setPage(pageNumber)}
            variant={pageNumber === page ? "outline" : "ghost"}
            className="w-9 h-9 p-0"
          >
            {pageNumber + 1}
          </Button>
        </PaginationItem>
      );
    });
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            disabled={page === 0}
            className="h-9 p-0 px-2"
            variant={"ghost"}
            onClick={() => {
              setPage(page - 1);
            }}
          >
            <ChevronLeft className="w-5 h-5" /> {tAll("previous")}
          </Button>
        </PaginationItem>
        {renderPagination()}
        <PaginationItem>
          <Button
            disabled={page === pageSize - 1}
            className="h-9 p-0 px-2"
            variant={"ghost"}
            onClick={() => {
              setPage(page + 1);
            }}
          >
            {tAll("next")} <ChevronRight className="w-5 h-5" />
          </Button>
        </PaginationItem>
        {!isMobile && (
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setPage(0);
              setLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-fit cursor-pointer">
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent className="min-w-0">
              <SelectGroup>
                {[12, 24, 36, 48].map((item) => (
                  <SelectItem
                    key={item}
                    className="cursor-pointer"
                    value={item.toString()}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default AutoPagination;
