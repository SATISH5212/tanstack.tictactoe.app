import { useLocationContext } from "@/components/context/LocationContext";
import { usePondsDataContext } from "@/components/context/PondsDataprovider";
import DeleteDialog from "@/components/core/DeleteDialog";
import LocationDropdown from "@/components/core/LocationDropdown";
import SearchFilter from "@/components/core/SearchFilter";
import TanStackTable from "@/components/core/TanstackTable";
import { LayoutIcon } from "@/components/svg/LayoutIcon";
import { Button } from "@/components/ui/button";
import PondStatusFilter from "@/components/usersModule/PondsFilter";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Pond, PondStatusChangePayload } from "@/lib/interfaces/maps/ponds";
import { deletePondAPI, PondStatusChangeAPI } from "@/lib/services/ponds";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import PondStatusChangeDialog from "../PondStatusChangeDialog";
import PondsColumns from "./PondsColumns";

const PondsTableView = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const { isOwner } = useUserDetails();
  const {
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
  } = usePondsDataContext();
  const {
    locations,
    selectedLocation,
    selectedLocationId,
    locationSearchString,
    setLocationSearchString,
    isLocationsLoading,
    setIsLocationSelectOpen,
    handleLocationChange,
    handleClearLocation,
  } = useLocationContext();

  const [selectedRows, setSelectedRows] = useState<Map<number, string>>(new Map());
  const [deletePondObj, setDeletePondObj] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);

  const allSelected =
    pondsData.length > 0 && selectedRows.size === pondsData.length;
  const { mutate: changePondStatus, isPending: isPondStatusChangePending } =
    useMutation({
      mutationFn: (payload: PondStatusChangePayload) =>
        PondStatusChangeAPI(payload),
      onSuccess: (res) => {
        toast.success(res?.data?.message ?? "Pond status updated successfully");
        setPondStatus(pondStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE");
        queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] });
        setShowStatusChangeDialog(false);
        setSelectedRows(new Map());
      },
      onError: (err: any) =>
        toast.error(err?.data?.message ?? "Failed to update status"),
    });

  const { mutate: deletePond, isPending: isDeletePending } = useMutation({
    mutationFn: (pondId: number) => deletePondAPI(pondId),
    onSuccess: (res) => {
      toast.success(res?.data?.message ?? "Pond deleted");
      queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] });
      queryClient.invalidateQueries({ queryKey: ["single-pond"] });
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      setIsDeleteDialogOpen(false);
      setSelectedRows(new Map());
      navigate({ to: "/ponds" });
    },
    onError: (err: any) =>
      toast.error(err?.data?.message ?? "Failed to delete pond"),
  });

  const handlePondStatusChange = (value: string | null) => {
    if (value === null) {
      searchParams.delete("pondStatus");
      navigate({
        to: window.location.pathname,
        search: {},
        replace: true,
      });
    } else {
      searchParams.set("pondStatus", value);
      navigate({
        to: window.location.pathname,
        search: { pondStatus: value },
        replace: true,
      });
    }

    setPondStatus(value as string);
  };

  const handleCheckboxRowSelect = (id: number, title: string) => {
    setSelectedRows((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.set(id, title);
      }
      return newMap;
    });
  };

  const handleSelectAllCheckbox = () => {
    if (selectedRows.size === pondsData.length) {
      setSelectedRows(new Map());
    } else {
      const all = new Map<number, string>();
      pondsData.forEach((p) => {
        all.set(p.id, p.title);
      });
      setSelectedRows(all);
    }
  };

  const handleRowClick = (pond: Pond) => {
    navigate({
      to: `/ponds/${pond.id}`,
      search: {
        search_pond: debounceSearchString || undefined,
        location_id: selectedLocationId || undefined,
      },
    });
  };

  const onDeletePond = (pond: Pond) => {
    setDeletePondObj(pond);
    setIsDeleteDialogOpen(true);
  };

  const onEditPond = (pond: Pond) => {
    navigate({
      to: "/dashboard",
      search: {
        pond: pond.id,
        edit: true,
        pond_location_id: pond.location_id,
      },
      replace: true,
    });
  };

  const handleLayoutChange = () => {
    navigate({ to: "/dashboard", });
  };

  useEffect(() => {
    const t = setTimeout(() => setDebounceSearchString(searchString), 500);
    return () => clearTimeout(t);
  }, [searchString]);

  useEffect(() => {
    navigate({
      to: pathname,
      search: (prev: any) => ({
        ...prev,
        search_pond: debounceSearchString || undefined,
        location_id: selectedLocationId || undefined,
      }),
      replace: true,
    });
  }, [debounceSearchString, selectedLocationId, navigate, pathname]);

  const handleDeleteConfirm = () => deletePond(deletePondObj.id);
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeletePondObj(null);
  };
  const handleConfirmChangeStatus = (changes: Map<number, string>) => {
    const pondIds = Array.from(changes.keys());
    const status = pondStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    searchParams.set("pondStatus", status);
    navigate({
      to: window.location.pathname,
      search: { pondStatus: status },
      replace: true,
    });
    changePondStatus({ pondIds, status });
  };

  useEffect(() => {
    if (pondStatus) {
      setSelectedFiltersCount(1);
    } else {
      setSelectedFiltersCount(0);
    }
  }, [pondStatus]);

  return (
    <div className="flex flex-row w-full h-[calc(100vh-65px)] overflow-hidden !border-0">
      <div className="flex border-r border-gray-200 flex-col w-3/5 flex-shrink-0">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between w-full px-2 mt-2">
            <div className="flex gap-2">
              <div
                className="h-8 w-[190px] flex justify-start items-start gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs 3xl:text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <LocationDropdown
                  pond={{ location: selectedLocation?.id }}
                  locations={locations}
                  isLocationsLoading={isLocationsLoading}
                  searchString={locationSearchString}
                  setSearchString={setLocationSearchString}
                  setIsSelectOpen={setIsLocationSelectOpen}
                  handlePondLocationChange={handleLocationChange}
                  selectedLocation={selectedLocation}
                  handleClearLocation={handleClearLocation}
                />
              </div>

              <SearchFilter
                searchString={searchString}
                setSearchString={setSearchString}
                title="Search Ponds"
                className="h-8 border border-slate-300 rounded-md overflow-hidden w-[180px]"
              />
            </div>

            <div className="flex gap-2 ">
              {selectedRows.size > 0 && (
                <button
                  onClick={() => setShowStatusChangeDialog(true)}
                  className={`${pondStatus === "ACTIVE" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600 "} text-white   text-xs px-2 rounded-md`}
                >
                  {pondStatus === "ACTIVE" ? "Deactivate" : "Activate"}
                </button>
              )}
              <div className="flex items-center">
                <PondStatusFilter
                  pondStatus={pondStatus}
                  onStatusChange={handlePondStatusChange}
                  selectedFiltersCount={selectedFiltersCount}
                  setSelectedRows={setSelectedRows}
                />
              </div>

              {isOwner() && (
                <button
                  onClick={() =>
                    navigate({
                      to: "/dashboard",
                      search: { add: true },
                    })
                  }
                  className="shrink-0 items-center px-2 bg-green-500  hover:bg-green-600  text-white text-xs rounded-lg transition-colors"
                >
                  + Add Pond
                </button>
              )}

              <Button
                className="bg-gray-400 hover:bg-gray-400 text-white text-xs h-8 rounded-lg flex items-center"
                onClick={handleLayoutChange}
              >
                <LayoutIcon className="w-4 h-4" /> Map View
              </Button>
            </div>
          </div>
        </div>

        <div
          id="pondsTable"
          className="relative overflow-auto flex-1 w-full px-2 mt-2"
        >
          <TanStackTable
            columns={PondsColumns(
              onEditPond,
              onDeletePond,
              selectedRows,
              handleCheckboxRowSelect,
              handleSelectAllCheckbox,
              allSelected,
              pondStatus
            )}
            data={pondsData}
            lastRowRef={lastRowRef}
            noDataLabel="No Ponds Found"
            removeSortingForColumnIds={[
              "select",
              "actions",
              "control_mode",
              "alert_count",
              "motors_off_count",
              "motors_on_count",
              "power_on_count",
              "motors_count",
              "title",
              "serial",
            ]}
            loading={isFetching && !isFetchingNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onRowClick={handleRowClick}
            heightClass="h-tableheght"
            tableType="ponds"
          />
          <DeleteDialog
            openOrNot={isDeleteDialogOpen}
            label="Are you sure you want to delete this pond?"
            onCancelClick={handleDeleteCancel}
            onOKClick={handleDeleteConfirm}
            deleteLoading={isDeletePending}
            buttonLable="Yes! Delete"
            buttonLabling="Deleting..."
          />
          <PondStatusChangeDialog
            isOpen={showStatusChangeDialog}
            type="pondStatus"
            isPending={isPondStatusChangePending}
            changes={selectedRows}
            onCancel={() => setShowStatusChangeDialog(false)}
            onConfirm={handleConfirmChangeStatus}
            pondStatus={pondStatus}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default PondsTableView;