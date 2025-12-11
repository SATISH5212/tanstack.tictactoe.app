import { useLocationContext } from "@/components/context/LocationContext";
import DeleteDialog from "@/components/core/DeleteDialog";
import LocationDropdown from "@/components/core/LocationDropdown";
import MotorPowerInput from "@/components/core/motorPowerInput";
import AddPlusIcon from "@/components/svg/AddPlusIcon";
import BackIcon from "@/components/svg/BackButtonIcon";
import TrashIcon from "@/components/svg/TrashIcon";
import { Input } from "@/components/ui/input";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { IAddPondSideBarProps, Motor } from "@/lib/interfaces/maps/ponds";
import { addUserLocationAPI } from "@/lib/services";
import { AddPondInMapAPI, updatePondInMapAPI } from "@/lib/services/ponds";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CircleCheck, CircleX, Loader2, X } from "lucide-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const AddPondSideBar: FC<IAddPondSideBarProps> = (props) => {
  const {
    pond,
    setPond,
    handleAddMotor,
    isAddingMotor,
    handleMotorNameChange,
    handleMotorPowerChange,
    handleDeleteMotor,
    handleCancel,
    errorMessage,
    setErrorMessage,
    pondName,
    setPondName,
    locationCentroid,
    setIsPondAdding,
    setIsPondEditing,
    originalPond = null,
    isPondEditing = false,
    deleteMotor,
    isDeletingMotorPending,
    setSelectedLocation,
    setSelectedLocationId,
    selectedMotorId,
    addPondsToMap,
  } = props;

  const {
    locations,
    selectedLocation,
    locationSearchString,
    setLocationSearchString,
    isLocationsLoading,
    setIsLocationSelectOpen,
    handleLocationChange,
    handleClearLocation,
  } = useLocationContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const motorRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocationTitle, setNewLocationTitle] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const { userId, isSupervisor } = useUserDetails();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteMotorId, setDeleteMotorId] = useState<number | null>(null);

  const { mutate: addPond, isPending: isAddingPond } = useMutation({
    mutationKey: ["add-pond-map"],
    retry: false,
    mutationFn: async (data: any) => {
      return await AddPondInMapAPI(data);
    },
    onSuccess: async (response) => {
      toast.success("Pond added successfully!");
      setErrorMessage(null);
      setPond(null);
      setIsPondAdding(false);
      setIsPondEditing(false);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["all-ponds"] }),
        queryClient.refetchQueries({ queryKey: ["paginated-ponds"] }),
        queryClient.refetchQueries({ queryKey: ["single-pond"] }),
      ]);
      addPondsToMap();
    },
    onError: (error: any) => {
      if (error?.status === 409 || error?.status === 400) {
        toast.error(error?.data?.message || "A pond with this name already exists.");
      } else {
        setErrorMessage(error?.data?.errors);
      }
    },
  });


  const { mutate: updatePond, isPending: isUpdatingPond } = useMutation({
    mutationKey: ["update-pond-map"],
    retry: false,
    mutationFn: async (data: any) => {
      if (!originalPond?.id) throw new Error("Pond ID is required for update");
      return await updatePondInMapAPI({ id: originalPond.id, ...data });
    },
    onSuccess: () => {
      toast.success("Pond updated successfully!");
      setErrorMessage(null);
      setPond(null);
      setIsPondAdding(false);
      setIsPondEditing(false);
      queryClient.invalidateQueries({ queryKey: ["all-ponds"] });
      queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] });
      queryClient.invalidateQueries({ queryKey: ["single-pond"] });
      if (setIsPondEditing) setIsPondEditing(false);
      if (!pond) return;
      navigate({ to: `/ponds/${pond.id}?location_id=${selectedLocation?.id}`, replace: true });
    },
    onError: (error: any) => {
      if (error?.status === 409 || error?.status === 400) {
        toast.error(
          error?.data?.message || "A pond with this name already exists."
        );
      } else {
        setErrorMessage(error?.data?.errors);
      }
    },
  });

  const handleSavePond = () => {
    if (!pond) return toast.info("Please draw the pond");

    const updatedPond = {
      ...pond,
      name: pondName,
      location: pond.location,
      area: pond.area,
    };

    const pondCoordinates = updatedPond.coordinates.map((coord: any) => {
      if (Array.isArray(coord)) {
        return { lng: coord[0], lat: coord[1] };
      }
      return { lng: coord.lng, lat: coord.lat };
    });

    const motors = updatedPond.motors.map((motor: any) => {
      const motorData: any = {
        ...(motor.name ? { title: motor.name } : { title: "" }),
        ...(motor.power ? { hp: motor.power.toString() } : { hp: "" }),
        motor_coordinates: {
          lng: Array.isArray(motor.location)
            ? motor.location[0]
            : motor.location.lng,
          lat: Array.isArray(motor.location)
            ? motor.location[1]
            : motor.location.lat,
        },
      };
      if (isPondEditing && motor.id && originalPond?.motors) {
        const isExistingMotor = originalPond.motors.some(
          (existingMotor: any) => existingMotor.id === motor.id
        );

        if (isExistingMotor) {
          motorData.id = motor.id;
        } else {
          motorData.is_new_motor = true;
        }
      } else if (isPondEditing && !originalPond?.motors?.some((m: any) => m.id === motor.id)) {
        motorData.is_new_motor = true;
      }

      return motorData;
    });

    const acres = Number(updatedPond.area).toFixed(2);
    const gatewayId = (originalPond?.gateway_id || originalPond?.gateway?.id)
      ? (originalPond?.gateway_id || originalPond?.gateway?.id)
      : null;

    const payload = {
      title: updatedPond.name,
      pond_coordinates: pondCoordinates,
      location_id: selectedLocation ? selectedLocation?.id : Number(pond.location),
      ...((isPondEditing && gatewayId != null) ? { gateway_id: gatewayId } : {}),
      motors: motors,
      acres: parseFloat(acres),
    };

    setLocationError(null);
    setErrorMessage(null);

    if (isPondEditing) {
      return updatePond(payload);
    } else {
      return addPond(payload);
    }
  };

  const locationMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      user_id: number;
      location_coordinates: any;
    }) => {
      return addUserLocationAPI(payload);
    },
    onSuccess: (data: any) => {
      const newLocationId = data?.data?.data?.id;
      const newLocation = data?.data?.data;
      if (pond) {
        setPond({ ...pond, location: newLocationId });
      }
      if (setSelectedLocation) {
        setSelectedLocation(newLocation);
      }

      if (setSelectedLocationId) {
        setSelectedLocationId(newLocationId);
      }

      if (handleLocationChange) {
        handleLocationChange(newLocationId.toString());
      }
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setNewLocationTitle("");
      setLocationError(null);
      setIsAddingLocation(false);

      toast.success("Location added successfully");
    },
    onError: (error: any) => {
      if (error?.status === 409) return toast.error(error?.data?.message);
      const errorMessage = error?.data?.errors?.title || error?.message;
      setLocationError(errorMessage);
    },
  });







  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteMotorId(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteMotorId || !originalPond?.id) {
      toast.error("Invalid motor or pond selection");
      return;
    }
    deleteMotor({ motorId: deleteMotorId, pondId: originalPond.id });
    if (pond) {
      setPond({
        ...pond,
        motors: pond.motors.filter((m: any) => m.id !== deleteMotorId),
      });
    }
    setIsDeleteDialogOpen(false);
    setDeleteMotorId(null);
  };

  const handlePondNameChange = useCallback(
    (name: string) => {
      if (pond) {
        setPondName(name);
        setPond({ ...pond, name });
      } else {
        setPondName(name);
      }

      if (errorMessage?.title) {
        setErrorMessage((prev: any) => {
          if (!prev) return null;
          const { title, ...rest } = prev;
          return Object.keys(rest).length > 0 ? rest : null;
        });
      }
    },
    [pond, setPond, setPondName, errorMessage, setErrorMessage]
  );


  const handleAddNewLocationClick = () => {
    setIsAddingLocation(true);

    if (errorMessage?.location_id) {
      setErrorMessage((prev: any) => {
        if (!prev) return null;
        const { location_id, ...rest } = prev;
        return Object.keys(rest).length > 0 ? rest : null;
      });
    }
  };

  const handleNewLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLocationTitle(e.target.value);
    setLocationError(null);
  };

  const handleAddNewLocation = () => {
    if (!newLocationTitle.trim()) {
      setLocationError("Location name cannot be empty");
      return;
    }
    locationMutation.mutate({
      title: newLocationTitle.trim(),
      user_id: Number(userId),
      location_coordinates: {
        lng: locationCentroid[0],
        lat: locationCentroid[1],
      },
    });
  };

  const handleCancelAddLocation = () => {
    setNewLocationTitle("");
    setLocationError(null);
    setIsAddingLocation(false);
  };


  useEffect(() => {
    if (selectedMotorId != null && motorRefs.current[selectedMotorId]) {
      motorRefs.current[selectedMotorId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedMotorId]);


  const isPending = isPondEditing ? isUpdatingPond : isAddingPond;
  return (
    <div className="absolute my-2 left-2 z-10 w-[400px] flex flex-col h-[98%] bg-white shadow-2xl rounded-xl  overflow-y-auto font-sans ">
      <div className="flex items-center  bg-gray-100 px-4">
        <button
          className="flex mr-3 text-gray-600 hover:text-black"
          onClick={handleCancel}
        >
          <BackIcon className="size-4" />
        </button>
        <h2 className="flex flex-grow text-md justify-center tracking-tight">
          {isPondEditing ? "Edit Pond" : "Add New Pond"}
        </h2>
      </div>

      <div className="my-3 px-4">
        <label className="block text-sm font-medium text-gray-600 ">
          Pond Name
          <span className="text-red-500 ml-1">*</span>
        </label>

        <input
          type="text"
          placeholder="Enter Pond Name"
          value={pondName || pond?.name}
          onChange={(e) => handlePondNameChange(e.target.value)}
          className="w-full border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 mt-1  capitalize"
        />
        {errorMessage?.title && (
          <p className="text-red-500 text-xs mt-1">{errorMessage.title}</p>
        )}
      </div>

      {pond && (
        <div className="px-4">
          <div className="mb-1">
            <span className="flex justify-between text-sm font-medium text-gray-600 mb-1">
              <label className="block">
                Location <span className="text-red-500 ">*</span>
              </label>
              <button
                onClick={handleAddNewLocationClick}
                className="flex space-x-1 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAddingLocation}
              >
                <span className="flex space-x-1 items-center">
                  <AddPlusIcon className="size-3" />
                  <span>Add</span>
                </span>
              </button>
            </span>

            {!isAddingLocation && (
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
            )}

            {isAddingLocation && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs placeholder:font-inter placeholder:text-xs font-light capitalize"
                  placeholder="Enter new location"
                  value={newLocationTitle}
                  onChange={handleNewLocationChange}
                  maxLength={30}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddNewLocation();
                    }
                  }}
                />
                <button
                  onClick={handleAddNewLocation}
                  disabled={locationMutation.isPending}
                  className="text-white border-none bg-transparent hover:bg-transparent p-0 disabled:opacity-50"
                >
                  {locationMutation.isPending ? (
                    <Loader2 className="animate-spin size-3 text-green-600 h-5 w-5" />
                  ) : (
                    <CircleCheck className="size-3 text-green-600 h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleCancelAddLocation}
                  className="hover:text-white p-0 border-none bg-transparent hover:bg-transparent"
                >
                  <CircleX className="size-3 text-red-600 w-5 h-5" />
                </button>
              </div>
            )}

            {locationError && (
              <p className="text-red-500 text-xs mt-1">{locationError}</p>
            )}

            {errorMessage?.location_id && (
              <p className="text-red-500 text-xs mt-1">
                {errorMessage.location_id}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Area
            </label>
            <input
              type="text"
              value={pond ? `${pond.area} acres` : "0 acres"}
              disabled
              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-[#B4C1D64D] capitalize "
            />
          </div>
        </div>
      )}

      {pond && (
        <div className="mb-1 px-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-600">
              Motors ({pond.motors.length})
            </label>
            {!isSupervisor() && (
              <button
                onClick={handleAddMotor}
                disabled={isAddingMotor}
                className={`px-3 py-1 rounded-lg transition-colors text-sm ${isAddingMotor
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "text-sm font-medium text-gray-600"
                  }`}
              >
                <span className="flex space-x-1  items-center">
                  <AddPlusIcon className="size-3" />
                  <span>Add</span>
                </span>
              </button>
            )}

          </div>

          {pond.motors.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto rounded bg-[#F2F2F2] pb-8 p-2">
              {pond.motors.map((motor: any, index: number) => (
                <div key={motor.id}
                  ref={(el) => { motorRefs.current[motor.id] = el }}
                  className={`rounded relative ${selectedMotorId === motor.id && "bg-gray-300 p-2 rounded-lg"}`}                >

                  {!isPondEditing && (
                    <button
                      onClick={() => handleDeleteMotor(motor.id)}
                      className="text-red-500 hover:text-red-700 text-xs absolute -top-1 -right-1  p-1"
                      title="Delete Motor"
                    >
                      <X className="size-4" />
                    </button>
                  )}

                  <div className={`flex items-start justify-between gap-4 `}>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Motor Name <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        value={motor.name || ""}
                        onChange={(e) =>
                          handleMotorNameChange(motor.id, e.target.value)
                        }
                        className="w-full h-9 capitalize px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-700"
                        placeholder="Motor Name"
                      />

                      <p className="h-2 text-red-500 text-xs mt-1">
                        {errorMessage?.[`motors[${index}].title`] || ""}
                      </p>
                    </div>

                    <div className="w-32 flex flex-col">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Power (HP) <span className="text-red-500">*</span>
                      </label>

                      <MotorPowerInput
                        motor={motor}
                        handleMotorPowerChange={handleMotorPowerChange}
                      />

                      <p className="h-2 text-red-500 text-xs mt-1">
                        {errorMessage?.[`motors[${index}].hp`] || ""}
                      </p>
                    </div>

                    <div className="flex justify-center mt-7">
                      {isPondEditing && !isSupervisor() && (
                        <button
                          onClick={() => {
                            if (motor?.id != originalPond?.motors.find((m: Motor) => m.id === motor.id)?.id) {
                              handleDeleteMotor(motor.id);
                            } else {

                              setDeleteMotorId(motor.id);
                              setIsDeleteDialogOpen(true);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 self-end pb-1"
                          title="Delete Motor"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <DeleteDialog
                    openOrNot={isDeleteDialogOpen}
                    label="Are you sure you want to delete this motor?"
                    onCancelClick={handleDeleteCancel}
                    onOKClick={handleDeleteConfirm}
                    deleteLoading={isDeletingMotorPending}
                    buttonLable="Yes! Delete"
                    buttonLabling="Deleting..."
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-1 left-2 w-[400px] flex justify-between items-center py-3 border-t bg-gray-100 px-4 shadow-lg rounded-xl">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-200"
        >
          {pond && !isPondEditing ? "Cancel " : "Cancel"}
        </button>
        <button
          onClick={handleSavePond}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${isPending
            ? "bg-gray-300 text-gray-500 pointer-events-none"
            : "bg-green-500 text-white hover:bg-green-600"
            }`}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isPondEditing ? (
            "Update"
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddPondSideBar;
