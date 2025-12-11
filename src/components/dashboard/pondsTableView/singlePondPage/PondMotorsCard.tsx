import { Button } from "@/components/ui/button";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import DeleteDialog from "@/components/core/DeleteDialog";
import BackArrow from "@/components/icons/BackButton";
import { NoDeviceMotorData } from "@/components/svg/NoDeviceMotorData";
import { getModeNumber } from "@/lib/helpers/map/mqttHelpers/motorModeConversion";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Motor, UserDevices } from "@/lib/interfaces/maps/ponds";
import { Gateway } from "@/lib/interfaces/users";
import {
  getSingleMotorAPI,
  removeDeviceFromMotorAPI,
} from "@/lib/services/deviceses";
import { addDeviceToUserAPI, getAllUserDevicesAPI } from "@/lib/services/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import DeviceSelectionDropdown from "./deviceSelectionDropdown";
import MotorActivitySheet from "./MotorActivityPage";
import MotorCard from "./MotorCard";
import MotorCardsList from "./MotorCardsList";
import MotorChangeConfirmDialog from "./MotorChangeConfirmDialog";
import MotorChangePublishButtons from "./MotorChangePublishButtons";
import SinglePondLogs from "./SinglePondLogs";

const PondMotorsCard: FC<any> = (props) => {
  const {
    onClose,
    selectedPondIndex,
    mapPonds,
    dateRange,
    setDateRange,
    handleMotorContorlPublish,
    handleMotorModePublish,
    motors,
    isSinglePondLoading,
    deleteMotor,
    isDeletingMotorPending,
  } = props;
  const [selectedMotorId, setSelectedMotorId] = useState<number | string>("");
  const [activeTab, setActiveTab] = useState("motors");
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(
    null
  );
  const [starterId, setStarterId] = useState<string>("");
  const [searchString, setSearchString] = useState<string>("");
  const [openDropdownMotorId, setOpenDropdownMotorId] = useState<number | null>(
    null
  );
  const [connectedNotes, setConnectedNotes] = useState<string[]>([]);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [openMotorId, setOpenMotorId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const replaceDropdownRef = useRef<HTMLDivElement>(null);
  const [dateValue, setDateValue] = useState<Date[] | null>(null);
  const [selectedMotorIds, setSelectedMotorIds] = useState<number[]>([]);

  const { isOwner, isManager } = useUserDetails();
  const selectedPond =
    selectedPondIndex != null && mapPonds[selectedPondIndex]
      ? mapPonds[selectedPondIndex]
      : null;

  const [selectedMotors, setSelectedMotors] = useState<
    Map<
      number,
      {
        id: number;
        title: string;
        newState: number;
        mac_address: string;
        motor_ref_id: string;
        gateway: Gateway;
      }
    >
  >(new Map());
  const [showMotorChangeConfirmDialog, setShowMotorChangeConfirmDialog] = useState(false);
  const [selectedMotorModes, setSelectedMotorModes] = useState<Map<number, {
    id: number;
    title: string;
    newMode: number;
    mac_address: string;
    motor_ref_id: string;
    gateway: Gateway;
  }>>(new Map());
  const [showModeConfirmDialog, setShowModeConfirmDialog] = useState(false);

  const { data: userDevicesData, isLoading } = useQuery({
    queryKey: ["user-devices"],
    queryFn: async () => {
      const response = await getAllUserDevicesAPI();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: addDeviceToUser, isPending: isAddingDevicePending } =
    useMutation({
      mutationFn: ({ motorId, payload }: any) =>
        addDeviceToUserAPI(motorId, payload),
      onSuccess: () => {
        toast.success("Device connected successfully");
        queryClient.invalidateQueries({ queryKey: ["user-devices"] });
        queryClient.invalidateQueries({ queryKey: ["all-ponds"] });
        queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] });
        queryClient.invalidateQueries({ queryKey: ["single-pond"] });
      },
      onError: (err: any) => {
        toast.error(err?.data?.message || "Failed to connect device");
      },
      retry: false,
    });

  const {
    data: singleMotorData,
    isLoading: isMotorLoading,
    error: motorError,
  } = useQuery({
    queryKey: ["singleMotor", selectedMotorId, selectedPondIndex],
    queryFn: async () => {
      const response = await getSingleMotorAPI(selectedMotorId);
      return response.data.data;
    },
    enabled: !!selectedMotorId,
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const [deletedeviceObj, setDeleteDeviceObj] = useState<Motor | null>(null);

  const { mutate: deleteDevice, isPending: isDeleteDevicePending } =
    useMutation({
      mutationFn: removeDeviceFromMotorAPI,
      onSuccess: () => {
        toast.success("Device Removed Successfully");
        queryClient.invalidateQueries({ queryKey: ["user-devices"] });
        queryClient.invalidateQueries({ queryKey: ["all-ponds"] });
        queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] });
        queryClient.invalidateQueries({ queryKey: ["single-pond"] });

        setIsDeleteDialogOpen(false);
        setDeleteDeviceObj(null);
      },
      onError: (error: any) => {
        if (error?.status === 409) {
          toast.error(error?.data?.message);
        }
      },
      retry: false,
    });

  const handleBackClick = () => {
    onClose();
    setActiveTab("motors");
  };

  const filteredDevices = useMemo(() => {
    if (!userDevicesData || userDevicesData.length === 0) return [];
    if (!searchString.trim()) return userDevicesData;

    const searchLower = searchString.toLowerCase().trim();
    return userDevicesData.filter((device: UserDevices) => {
      const aliasTitle = device.alias_starter_title?.toLowerCase() || "";
      const title = device.title?.toLowerCase() || "";
      return aliasTitle.includes(searchLower) || title.includes(searchLower);
    });
  }, [userDevicesData, searchString]);

  const handleConfigClick = (e: React.MouseEvent, motor: Motor) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownMotorId(openDropdownMotorId === motor.id ? null : motor.id);
    setIsReplaceMode(false);
    setSearchString("");
    setSelectedNodeIndex(null);
    setStarterId("");
  };

  const handleReplaceClick = (motor: Motor) => {
    setOpenDropdownMotorId(motor.id);
    setIsReplaceMode(true);
    setSearchString("");
    setSelectedNodeIndex(null);
    setStarterId("");
    setOpenMotorId(null);
  };

  const handleNodeClick = (nodeIndex: number, device: UserDevices) => {
    setSelectedNodeIndex(nodeIndex + 1);
    setStarterId(device.id as unknown as string);
    setConnectedNotes(device.connected_nodes);
    setConnectedNotes((prev) => [
      ...prev,
      nodeIndex + 1 === 2 ? "mtr_2" : "mtr_1",
    ]);
  };

  const handleConnectClick = (motor: Motor) => {
    if (!starterId || selectedNodeIndex === null) {
      toast.error("Please select a node first");
      return;
    }
    const connectingNode = selectedNodeIndex === 2 ? "mtr_2" : "mtr_1";

    const payload = {
      starter_id: starterId,
      motor_ref_id: connectingNode,
      connected_nodes: connectedNotes,

      ...(motor.starter_id
        ? { old_starter_id: motor.starter_id }
        : { old_starter_id: null }),
      ...(motor.motor_ref_id
        ? { old_motor_ref_id: motor.motor_ref_id }
        : { old_motor_ref_id: null }),
    };

    addDeviceToUser(
      { motorId: motor.id, payload },
      {
        onSuccess: () => {
          setSelectedNodeIndex(null);
          setStarterId("");
          setSearchString("");
          setOpenDropdownMotorId(null);
          setIsReplaceMode(false);
        },
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        replaceDropdownRef.current &&
        !replaceDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownMotorId(null);
        setSearchString("");
        setSelectedNodeIndex(null);
        setStarterId("");
        setIsReplaceMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === "analytics" && !selectedMotorId && motors.length > 0) {
      setSelectedMotorId(Number(motors[0].id));
    }
  }, [activeTab, selectedMotorId, motors]);

  useEffect(() => {
    setSelectedMotors(new Map());
    setSelectedMotorModes(new Map());
  }, [selectedPondIndex]);

  const handleRemoveDeviceClick = (motor: Motor) => {
    setDeleteDeviceObj(motor);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => deleteDevice(deletedeviceObj?.id as number);

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteDeviceObj(null);
  };

  const handleCancelClick = () => {
    setOpenDropdownMotorId(null);
    setSearchString("");
    setSelectedNodeIndex(null);
    setStarterId("");
    setIsReplaceMode(false);
  };

  const deviceSelectionDropdown = (motor: Motor, refProp: any) => (
    <DeviceSelectionDropdown
      motor={motor}
      refProp={refProp}
      isReplaceMode={isReplaceMode}
      searchString={searchString}
      setSearchString={setSearchString}
      filteredDevices={filteredDevices}
      starterId={starterId}
      setStarterId={setStarterId}
      selectedNodeIndex={selectedNodeIndex}
      setSelectedNodeIndex={setSelectedNodeIndex}
      handleNodeClick={handleNodeClick}
      handleCancelClick={handleCancelClick}
      handleConnectClick={handleConnectClick}
      isPending={isAddingDevicePending}
      isLoading={isLoading}
    />
  );

  const handleMotorControlToggle = (motor: Motor, newState: number) => {
    setSelectedMotors((prev) => {
      const updated = new Map(prev);
      if (newState === motor.state) {
        updated.delete(motor.id);
      } else {
        updated.set(motor.id, {
          id: motor.id,
          title: motor.title,
          newState,
          mac_address: motor?.starterBox?.mac_address,
          motor_ref_id: motor?.motor_ref_id as string,
          gateway: motor?.starterBox?.gateways as Gateway,
        });
      }

      return updated;
    });
  };

  const handleMotorModeToggle = (motor: Motor, newMode: number) => {
    setSelectedMotorModes((prev) => {
      const updated = new Map(prev);
      if (newMode == getModeNumber(motor.mode)) {
        updated.delete(motor.id);
      } else {
        updated.set(motor.id, {
          id: motor.id,
          title: motor.title,
          newMode,
          mac_address: motor?.starterBox?.mac_address,
          motor_ref_id: motor?.motor_ref_id as string,
          gateway: motor?.starterBox?.gateways as Gateway,
        });
      }

      return updated;
    });
  };

  const handleMotorToggle = (motorId: number) => {
    setSelectedMotorIds((prev) =>
      prev.includes(motorId)
        ? prev.filter((id) => id !== motorId)
        : [...prev, motorId]
    );
  };

  useEffect(() => {
    if (activeTab === "analytics" && selectedMotorIds.length === 0 && motors.length > 0) {
      const firstVisibleMotor = motors.find((motor: Motor) => motor.starter_id);
      if (firstVisibleMotor) {
        setSelectedMotorIds([firstVisibleMotor.id]);
      }
    }
  }, [activeTab, motors]);

  return (
    selectedPond && (
      <div className="h-full border-l border-gray-200  overflow-y-hidden py-3 px-1">
        <div className="flex flex-row justify-between">
          <span className="flex items-center gap-1 w-1/3">
            <Button
              onClick={handleBackClick}
              className="bg-white hover:bg-gray-50 "
            >
              <BackArrow className="w-8 h-8 text-gray-700" />
            </Button>

            <h2
              className="turncate text-lg sm:text-base font-medium text-gray-800 tracking-tight truncate capitalize"
              title={selectedPond?.title}
            >
              {selectedPond?.title || "--"}
            </h2>
          </span>
          {activeTab === "analytics" ? (
            <span className="flex flex-wrap gap-1 w-2/3">
              <MotorCardsList
                motors={motors}
                selectedMotorIds={selectedMotorIds}
                handleMotorToggle={handleMotorToggle}
                setSelectedMotorIds={setSelectedMotorIds}
              />
            </span>
          ) : (
            (selectedMotors.size > 0 || selectedMotorModes.size > 0) &&
            activeTab === "motors" && (
              <MotorChangePublishButtons
                selectedMotors={selectedMotors}
                setShowMotorChangeConfirmDialog={
                  setShowMotorChangeConfirmDialog
                }
                selectedMotorModes={selectedMotorModes}
                setShowModeConfirmDialog={setShowModeConfirmDialog}
              />
            )
          )}
        </div>
        {isSinglePondLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <img
              src="/PeepulAgriLogo.svg"
              alt="Logo"
              className="w-28 h-28 opacity-80"
            />
          </div>
        ) : (
          <div className="w-full h-[calc(100vh-100px)] overflow-y-hidden rounded-xl">
            {!motors || motors.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-3 h-full bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <NoDeviceMotorData />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Motors Found
                </h3>
                <p className="text-sm text-gray-500">
                  This pond doesn't have any motors assigned yet.
                </p>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full h-full flex flex-col"
              >
                <TabsList className="flex gap-2 mb-2 justify-start flex-shrink-0 ml-2">
                  <TabsTrigger
                    value="motors"
                    className={`px-4 py-1 text-sm font-medium rounded-lg shadow-sm transition-colors ${activeTab === "motors"
                      ? "bg-green-100 text-green-600 border border-green-200 shadow-sm -translate-x-0.5"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                  >
                    Motors
                  </TabsTrigger>

                  <TabsTrigger
                    value="analytics"
                    className={`px-4 py-1 text-sm font-medium rounded-lg shadow-sm transition-colors ${activeTab === "analytics"
                      ? "bg-green-100 text-green-600 border border-green-200 shadow-sm -translate-x-0.5"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger
                    value="logs"
                    className={`px-4 py-1 text-sm font-medium rounded-lg shadow-sm transition-colors ${activeTab === "logs"
                      ? "bg-green-100 text-green-600 border border-green-200 shadow-sm -translate-x-0.5"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    Logs
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                  <TabsContent value="motors" className="h-[calc(100vh-100px)]">
                    <div className="space-y-3 px-2 h-full overflow-x-hidden hide-scrollbar">
                      {motors?.map((motor: Motor) => (
                        <MotorCard
                          key={motor.id}
                          motor={motor}
                          openMotorId={openMotorId}
                          setOpenMotorId={setOpenMotorId}
                          openDropdownMotorId={openDropdownMotorId}
                          isReplaceMode={isReplaceMode}
                          selectedMotors={selectedMotors}
                          selectedMotorModes={selectedMotorModes}
                          handleMotorControlToggle={handleMotorControlToggle}
                          handleMotorModeToggle={handleMotorModeToggle}
                          handleReplaceClick={handleReplaceClick}
                          handleRemoveDeviceClick={handleRemoveDeviceClick}
                          handleConfigClick={handleConfigClick}
                          deviceSelectionDropdown={deviceSelectionDropdown}
                          dropdownRef={dropdownRef}
                          replaceDropdownRef={replaceDropdownRef}
                          isOwner={isOwner}
                          isManager={isManager}
                          deleteMotor={deleteMotor}
                          isDeletingMotorPending={isDeletingMotorPending}
                          selectedPond={selectedPond}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="h-full">
                    <div className="h-full">
                      <MotorActivitySheet
                        selectedPondIndex={selectedPondIndex}
                        mapPonds={mapPonds}
                        singleMotorData={singleMotorData}
                        isMotorLoading={isMotorLoading}
                        dateValue={dateValue}
                        setDateValue={setDateValue}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        selectedMotorIds={selectedMotorIds}
                        setSelectedMotorIds={setSelectedMotorIds}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="logs" className="h-full">
                    <SinglePondLogs
                      pondId={selectedPond.id}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        )}

        <DeleteDialog
          openOrNot={isDeleteDialogOpen}
          label="Are you sure you want to remove this device?"
          onCancelClick={handleDeleteCancel}
          onOKClick={handleDeleteConfirm}
          deleteLoading={isDeleteDevicePending}
          buttonLable="Yes! Remove"
          buttonLabling="Removing..."
        />

        <MotorChangeConfirmDialog
          isOpen={showMotorChangeConfirmDialog}
          type="state"
          changes={selectedMotors}
          onCancel={() => setShowMotorChangeConfirmDialog(false)}
          onConfirm={(changes) => {
            handleMotorContorlPublish(changes);
            setShowMotorChangeConfirmDialog(false);
            setSelectedMotors(new Map());
          }}
        />

        <MotorChangeConfirmDialog
          isOpen={showModeConfirmDialog}
          type="mode"
          changes={selectedMotorModes}
          onCancel={() => setShowModeConfirmDialog(false)}
          onConfirm={(changes) => {
            handleMotorModePublish(changes);
            setShowModeConfirmDialog(false);
            setSelectedMotorModes(new Map());
          }}
        />
      </div>
    )
  );
};

export default PondMotorsCard;