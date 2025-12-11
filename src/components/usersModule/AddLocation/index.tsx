import MapSearchBox from "@/components/dashboard/MapSearchBox";
import { Button } from "@/components/ui/button";
import { useAddLocation } from "@/lib/helpers/map/addLocationHelper";
import { LocationPayload } from "@/lib/interfaces";
import { LocationDialogProps } from "@/lib/interfaces/users";
import { addUserLocationAPI, editLocationAPI } from "@/lib/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const LocationDialog = ({
  isOpen,
  onClose,
  locationId,
  initialTitle = "",
  initialCoordinates,
  isEditMode = false,
}: LocationDialogProps) => {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<
    Partial<LocationPayload & { api: string }>
  >({});

  const resetErrors = () => setErrors({});

  const {
    searchQuery,
    searchResults,
    isSearching,
    showResults,
    locationData,
    setSearchQuery,
    selectLocation,
    clearSearch,
    resetLocationState,
    setShowResults,
  } = useAddLocation({
    title: initialTitle,
    location_coordinates: initialCoordinates,
  });

  useEffect(() => {
    if (!isOpen) return;
    isEditMode && initialTitle ? setSearchQuery(initialTitle) : resetLocationState();
    resetErrors();
  }, [isOpen, isEditMode, initialTitle]);

  const mutation = useMutation({
    mutationFn: async (payload: LocationPayload) => {
      return isEditMode && locationId
        ? editLocationAPI(locationId, payload)
        : addUserLocationAPI(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userLocations"] });
      handleClose();
      toast.success(isEditMode ? "Location updated!" : "Location added!");
    },
    onError: (error: any) => {
      const status = error?.status;
      const data = error?.data;
      if (status === 422) return setErrors(data?.errors || {});
      if (status === 409) return setErrors(prev => ({ ...prev, api: data?.message }));
      toast.error(data?.message || "Something failed. Try again.");
    },
    retry: false,
  });

  const validateBeforeSubmit = () => {
    const { title, location_coordinates } = locationData;
    const newErrors: any = {};

    if (!title) {
      newErrors.title = "Location is required";
      setErrors(newErrors);
      return false;
    }
    if (!location_coordinates) {
      newErrors.location_coordinates = "Select a valid location with coordinates";
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };


  const handleSubmit = () => {
    if (!validateBeforeSubmit()) return;
    mutation.mutate({
      title: locationData.title,
      location_coordinates: locationData.location_coordinates,
    });
  };

  const handleClose = useCallback(() => {
    onClose();
    resetLocationState();
    resetErrors();
  }, [onClose, resetLocationState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-[92%] sm:w-[60%] md:w-[40%] lg:w-[38%] max-w-[400px] p-5 animate-scale-fade">
        <header className="flex items-center justify-between mb-4">
          <span className="text-md font-medium">
            {isEditMode ? "Edit" : "Add"} Location
            <span className="text-red-500 ml-1">*</span>
          </span>
          <button
            onClick={handleClose}
            className="h-6 w-6 hover:bg-red-200 text-red-500 rounded-full p-1"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-0.5">
          <MapSearchBox
            searchQuery={searchQuery}
            setSearchQuery={(v: any) => {
              setSearchQuery(v);
              resetErrors();
            }}
            searchResults={searchResults}
            isSearching={isSearching}
            showResults={showResults}
            selectLocation={(f: any) => {
              selectLocation(f);
              resetErrors();
            }}
            clearSearch={clearSearch}
            isAddingLocation
            setShowResults={setShowResults}
            setErrors={setErrors}
          />

          {locationData.location_coordinates && (
            <div className="text-xs text-green-700">
              Lat: {locationData.location_coordinates.lat.toFixed(6)} | Lng:{" "}
              {locationData.location_coordinates.lng.toFixed(6)}
            </div>
          )}

          {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
          {errors.location_coordinates && (
            <p className="text-red-500 text-xs">{errors?.location_coordinates as unknown as string}</p>
          )}
          {errors.api && <p className="text-red-500 text-xs">{errors.api}</p>}
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="h-8 text-sm"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="h-8 px-4 text-sm bg-green-600 hover:bg-green-700 text-white"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : isEditMode ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default LocationDialog;
