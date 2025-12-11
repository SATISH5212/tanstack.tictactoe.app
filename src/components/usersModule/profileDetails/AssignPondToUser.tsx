import React, { useState, useMemo, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { capitalize } from "src/lib/helpers/capitalize";
import { UserBasedPondsApi } from "@/lib/services";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AssignPondToUserProps {
  open: boolean;
  onClose: () => void;
  getData: () => void;
  user_id: number;
  assignPond: any;
  isPending: boolean;
  locationPonds: any;
}

interface PondProps {
  id: number;
  title: string;
}

const AssignPondToUser: React.FC<AssignPondToUserProps> = ({
  open,
  onClose,
  getData,
  user_id,
  assignPond,
  isPending,
  locationPonds,
}) => {
  const [search, setSearch] = useState("");
  const [selectedPond, setSelectedPond] = useState<PondProps[]>([]);
  const pondListRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const selectAllRef = useRef<HTMLButtonElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["ponds", search, user_id],
      queryFn: async ({ pageParam = 1 }) => {
        const queryParams: any = {
          page: pageParam,
          page_size: 20,
          search_string: search,
          user_id: user_id,
        };
        const response = await UserBasedPondsApi(queryParams);
        return response?.data?.data || { records: [], pagination_info: {} };
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage?.pagination_info) return undefined;
        const { current_page, total_pages } = lastPage.pagination_info;
        return current_page < total_pages ? current_page + 1 : undefined;
      },
      initialPageParam: 1,
      enabled: open,
    });

  const pondsData = useMemo(() => {
    const allPonds: PondProps[] = [];
    const pondMap = new Map<number, PondProps>();

    data?.pages.forEach((page) => {
      page.records?.forEach((record: any) => {
        const pond = { id: record.id, title: record.title };
        if (!pondMap.has(pond.id)) {
          pondMap.set(pond.id, pond);
        }
      });
    });

    return Array.from(pondMap.values());
  }, [data]);

  const filteredPonds = useMemo(() => {
    if (!search.trim()) return pondsData;

    return pondsData.filter((pond) =>
      pond.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [pondsData, search]);

  const assignedPondIds = useMemo(() => {
    return new Set(locationPonds?.map((loc: any) => loc.id));
  }, [locationPonds]);

  const isAllSelected = useMemo(() => {
    const selectablePonds = filteredPonds.filter(
      (pond) => !assignedPondIds.has(pond.id)
    );
    if (selectablePonds.length === 0) return false;
    return selectablePonds.every((pond) =>
      selectedPond.some((p) => p.id === pond.id)
    );
  }, [filteredPonds, selectedPond, assignedPondIds]);  

  const isIndeterminate = useMemo(() => {
    if (selectedPond.length === 0) return false;
    if (isAllSelected) return false;
    return filteredPonds.some((pond) =>
      selectedPond.some((p) => p.id === pond.id)
    );
  }, [filteredPonds, selectedPond, isAllSelected]);

  const handleScroll = (e: React.SyntheticEvent) => {
    const container = e.currentTarget as HTMLDivElement;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
    ) {
      fetchNextPage();
    }
  };

  const handleClose = () => {
    onClose();
    setSearch("");
    setSelectedPond([]);
    queryClient.removeQueries({ queryKey: ["ponds"] });
  };

  const handleTogglePond = (pond: PondProps) => {
    setSelectedPond((prev) => {
      const isSelected = prev.some((p) => p.id === pond.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== pond.id);
      } else {
        return [...prev, pond];
      }
    });
  };

  const handleSelectAll = () => {
    const selectablePonds = filteredPonds.filter(
      (pond) => !assignedPondIds.has(pond.id)
    );
    if (isAllSelected) {
      setSelectedPond((prev) =>
        prev.filter(
          (p) => !selectablePonds.some((pond) => pond.id === p.id)
        )
      );
    } else {
      setSelectedPond((prev) => {
        const newPonds = selectablePonds.filter(
          (pond) => !prev.some((p) => p.id === pond.id)
        );
        return [...prev, ...newPonds];
      });
    }
  };

  const handleConfirm = () => {
    if (selectedPond.length > 0 && user_id) {
      const pondIds = selectedPond.map((pond) => pond.id);
      assignPond(pondIds);
      getData();
      // handleClose();
    } else {
      toast.error("Please select at least one pond");
    }
  };

  const isPondSelected = (pondId: number) => {
    return selectedPond.some((p) => p.id === pondId);
  };

  React.useEffect(() => {
    const el = selectAllRef.current as any;
    if (el) el.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs rounded-lg bg-white p-4 [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-0 p-0">
          <DialogTitle className="text-sm 3xl:text-lg font-normal text-black sm:text-lg">
            Select Ponds
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
           className="h-6 w-6 rounded-full  hover:bg-red-200 text-red-500 hover:text-red-600 p-1 "
            onClick={handleClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </DialogHeader>
        <div className="mt-2">
          <Input
            type="search"
            placeholder="Search ponds"
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="h-8 rounded border border-gray-300 bg-white text-sm text-gray-500 focus:border-primary focus:ring-0"
          />

          {filteredPonds.length > 0 && (
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                ref={selectAllRef}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="select-all"
                className="text-xs font-medium text-gray-700 cursor-pointer"
              >
                Select All
              </Label>
            </div>
          )}

          <div
            ref={pondListRef}
            onScroll={handleScroll}
            className="h-60 overflow-y-auto mt-2"
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 mt-20">Loading ponds...</span>
              </div>
            ) : filteredPonds.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 mt-20">No ponds found.</span>
              </div>
            ) : (
              <>
                {filteredPonds?.map((pond: PondProps) => {
                  const isAssigned = assignedPondIds.has(pond.id);

                  return (
                    <div
                      key={pond?.id}
                      className={`flex items-center space-x-2 rounded p-2 ${
                        isAssigned
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Checkbox
                        id={pond?.id.toString()}
                        checked={isPondSelected(pond.id)}
                        onCheckedChange={() => handleTogglePond(pond)}
                        disabled={isAssigned}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor={pond?.id.toString()}
                        className="flex-1 cursor-pointer truncate text-smd 3xl:text-base font-normal text-black"
                      >
                        {pond?.title?.length > 20 ? (
                          <span title={pond?.title}>
                            {capitalize(pond?.title.slice(0, 20) + "...")}
                          </span>
                        ) : (
                          capitalize(pond?.title)
                        )}
                      </Label>
                    </div>
                  );
                })}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button
            disabled={selectedPond.length === 0}
            onClick={handleConfirm}
            className="bg-primary text-xs 3xl:text-sm font-medium text-white hover:bg-primary/90 h-auto py-1.5 w-20"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPondToUser;