import { PondsContextContextType } from "@/lib/interfaces/maps/ponds";
import { getAllPondsAPI } from "@/lib/services/ponds";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const PondsDataContext = createContext<PondsContextContextType>({
  pondsData: [],
  setSearchString: () => {},
  lastRowRef: () => {},
  searchString: "",
  debounceSearchString: "",
  setDebounceSearchString: () => {},
  isFetchingNextPage: false,
  isFetching: false,
  pondStatus: "ACTIVE",
  setPondStatus: () => {},
});

interface PondsDataProviderProps {
  children: ReactNode;
}

export const usePondsDataContext = () => useContext(PondsDataContext);
export const PondsProvider = ({ children }: PondsDataProviderProps) => {
  const searchParams = new URLSearchParams(window.location.search);
  const location = useLocation();
  const [pondStatus, setPondStatus] = useState<string>(
    searchParams.get("pondStatus") || "ACTIVE"
  );
  const locationId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("location_id") || "";
  }, [location.search]);
  const [searchString, setSearchString] = useState<string>(
    searchParams.get("search_pond") || ""
  );
  const [debounceSearchString, setDebounceSearchString] = useState<string>(
    searchParams.get("search_pond") || ""
  );
  const {
    data: allPondsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["paginated-ponds", debounceSearchString, locationId, pondStatus],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: any = {
        page: pageParam,
        limit: 20,
        ...(pondStatus && pondStatus !== "ALL" ? { status: pondStatus } : {}),
        ...(debounceSearchString && { search_string: debounceSearchString }),
        ...(locationId && { location_id: locationId }),
        starter_data: "true",
      };

      const response = await getAllPondsAPI(queryParams);
      const { records: ponds = [], pagination: apiPagination } =
        response?.data?.data || {};
      const startSerial = (pageParam - 1) * 10 + 1;
      const dataWithSerial = ponds.map((pond: any, index: number) => ({
        ...pond,
        serial: startSerial + index,
      }));

      return {
        data: dataWithSerial,
        pagination: apiPagination || {
          page_size: 10,
          total_pages: 0,
          total_records: 0,
          current_page: pageParam,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      if (current_page < total_pages) {
        return current_page + 1;
      }
      return undefined;
    },
    retry: false,
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const pondsData = useMemo(() => {
    return allPondsData?.pages.flatMap((page) => page.data) || [];
  }, [allPondsData]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetching || isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        {
          root: null,
          rootMargin: "200px",
          threshold: 0.5,
        }
      );
      if (node) observer.current.observe(node);
    },
    [isFetching, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <PondsDataContext.Provider
      value={{
        pondsData,
        setSearchString,
        lastRowRef,
        searchString,
        debounceSearchString,
        setDebounceSearchString,
        isFetchingNextPage,
        isFetching,
        pondStatus,
        setPondStatus,
      }}
    >
      {children}
    </PondsDataContext.Provider>
  );
};
