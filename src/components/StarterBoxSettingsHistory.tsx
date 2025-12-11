"use client";
import formatUstToIST from "src/lib/helpers/timeFormat";
import {
  DeviceSettingLog,
  StarterBoxSettingsHistoryProps,
} from "src/lib/interfaces/core/settings";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import FailedIcon from "./svg/FailedIcon";
import HistoryIcon from "./svg/HistoryIcon";
import SuccessIcon from "./svg/SuccessIcon";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import WarningIcon from "./icons/Warning";

const StarterBoxSettingsHistory = ({
  isOpen,
  onClose,
  hideTriggerOne = false,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  allRecords,
  isLoading,
  isFetching,
  setEditMode
}: StarterBoxSettingsHistoryProps) => {
  const [open, setOpen] = useState(false);
  const [internalClose, setInternalClose] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const setupObserver = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "100px",
        threshold: 0.5,
      }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const cleanup = setupObserver();
    if (isOpen || open) {
      const timer = setTimeout(() => {
        setupObserver();
      }, 300);

      return () => {
        clearTimeout(timer);
        cleanup && cleanup();
      };
    }

    return cleanup;
  }, [setupObserver, isOpen, open, allRecords.length]);

  const handleSheetOpenChange = (state: boolean) => {
    if (!state && !internalClose) onClose?.();
    setOpen(state);
    setInternalClose(false);
  };

  return (
    <div>
      <Sheet open={isOpen || open} onOpenChange={handleSheetOpenChange}>
        {!hideTriggerOne && (
          <SheetTrigger asChild>
            <Button
              className="flex items-center gap-1.5 bg-828282 border-none hover:bg-828282 text-xs 3xl:text-sm rounded-full text-white h-auto px-3 py-1 [&_svg]:size-3"
              onClick={() => {
                setOpen(true);
                setEditMode(false);
              }}

            >
              <HistoryIcon />
              <span>History</span>
            </Button>
          </SheetTrigger>
        )}
        <SheetContent className="bg-white min-w-custon_500px 2xl:min-w-custon_500px w-1/2 font-inter p-0 text-xs py-1 [&>button]:hidden">
          <SheetHeader className="flex flex-row items-center justify-between px-6 py-2 border-b sticky top-0 bg-white z-50 space-y-0 mb-4">
            <h1 className="m-0 leading-tight text-sm 3xl:text-lg font-medium">
              Settings History
            </h1>
            <Button
              variant="outline"
              className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600" 
              onClick={() => {
                setInternalClose(true);
                setOpen(false);
              }}
            >
              <X />
            </Button>
          </SheetHeader>
          {isLoading ? (
            <div className="flex justify-center items-center h-user_devices">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : allRecords?.length ? (
            <div
              ref={scrollContainerRef}
              className="p-4 pt-0 space-y-3 overflow-y-auto h-user_devices scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {allRecords.map((item: DeviceSettingLog, index: number) => (
                <div
                  key={item.id || index}
                  className="flex items-start gap-2 p-2 rounded-md bg-F2F2F2"
                >
                  {item?.is_new_configuration_saved === 0 ? (
                    item?.acknowledgement === "FALSE" ? (
                      <WarningIcon className="w-6 h-4 text-yellow-500 mt-1" />
                    ) : (
                      <FailedIcon className="size-3 mt-1" />
                    )) : (
                    <SuccessIcon className="size-3 mt-1" />
                  )}

                  <div>
                    {item?.is_new_configuration_saved === 0 ? (
                      item?.acknowledgement === "FALSE" ? (
                        <div className="font-inter text-black text-smd 3xl:text-base mb-1 font-medium leading-relaxed">
                          Acknowledgment not yet received.
                        </div>
                      ) : (
                        <div className="font-inter text-black text-smd 3xl:text-base mb-1 font-medium leading-relaxed">
                          Failed to update settings on
                        </div>
                      )
                    ) : (
                      <div className="font-inter text-black text-smd 3xl:text-base mb-1 font-medium leading-relaxed">
                        Last settings updated on
                      </div>
                    )}

                    <div className="text-xs 3xl:text-smd text-black/70 font-normal">
                      {formatUstToIST(item?.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
              <div
                ref={loadMoreRef}
                className="min-h-[100px] flex justify-center items-center"
              >
                {(isFetchingNextPage || isFetching) && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-user_devices">
              <div>No History</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StarterBoxSettingsHistory;
