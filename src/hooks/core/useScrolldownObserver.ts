import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  dataLength: number;
  containerId: string;
  rootMargin?: string;
  threshold?: number;
}

export const useScrolldownObserver = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  dataLength,
  containerId,
  rootMargin = "200px",
  threshold = 0.1,
}: UseInfiniteScrollOptions) => {
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const currentRef = lastRowRef.current;
    const scrollContainer = document.getElementById(containerId);

    if (!currentRef || !scrollContainer || isFetchingNextPage || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin,
        threshold,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [dataLength, hasNextPage, isFetchingNextPage, fetchNextPage, containerId, rootMargin, threshold]);

  return { lastRowRef };
};