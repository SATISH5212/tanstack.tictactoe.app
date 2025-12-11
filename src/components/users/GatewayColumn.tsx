import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  GatewayFormData,
  Location,
  LocationFormData
} from "src/lib/interfaces/users";
import {
  addGatewayAPI,
  addLocationAPI,
  deleteGatewayAPI,
  getallUserBasedLocation,
  updateGatewayAPI,
} from "src/lib/services/locations";
import DeleteDialog from "../core/DeleteDialog";
import Tabs from "../core/Tabs";
import LocationIcon from "../icons/users/location";
import { Button } from "../ui/button";
import AddLocation from "./AddLocation";
import GateWaySettings from "./GateWaySettings";

export function GatewayColumn() {
  const { user_id: userId } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [addingGatewayRow, setAddingGatewayRow] = useState<number | null>(null);
  const [editingGatewayId, setEditingGatewayId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [searchString, setSearchString] = useState<string>(
    searchParams.get("search_string") || ""
  );
  const [gatewayErrors, setGatewayErrors] = useState<
    Record<string, string | null>
  >({});
  const [formData, setFormData] = useState<LocationFormData>({
    title: "",
    user_id: Number(userId),
    gateway_title: null,
    location_coordinates: { lat: 0, lng: 0 },
  });
  const [gatewayFormData, setGatewayFormData] = useState<GatewayFormData>({
    title: "",
    location_id: 0,
    user_id: Number(userId),
    status: "ACTIVE",
  });
  const [errormessage, setErrormessage] = useState<string>("");
  const [gatewayErrormessage, setGatewayErrormessage] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState(false);
  const [expandedGateway, setExpandedGateway] = useState<number | null>(null);

  const {
    data: gatewayData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["getAllgateways", userId, searchString],
    queryFn: async () => {
      const response = await getallUserBasedLocation(userId, {
        search_string: searchString,
      });
      return response.data.data as Location[];
    },
    refetchOnWindowFocus: false,
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  useEffect(() => {
    if (gatewayData && gatewayData.length > 0 && !selectedLocation) {
      setSelectedLocation(gatewayData[0]);
    }
  }, [gatewayData, selectedLocation]);

  useEffect(() => {
    setAddingGatewayRow(null);
    setEditingGatewayId(null);
    setGatewayFormData({
      title: "",
      location_id: 0,
      user_id: Number(userId),
      status: "ACTIVE",
    });
    setGatewayErrors({});
    setGatewayErrormessage("");
  }, [selectedLocation, userId]);

  const { mutateAsync: mutateAddLocation, isPending: isStatusPending } =
    useMutation({
      mutationKey: ["add-location"],
      retry: false,
      mutationFn: async (data: LocationFormData) => {
        const response = await addLocationAPI(data);
        return response;
      },
      onSuccess: (response: any) => {
        toast.success("Location created successfully!");
        setIsAddingLocation(false);
        setFormData({ title: "", user_id: Number(userId), gateway_title: "", location_coordinates: { lat: 0, lng: 0 } });
        queryClient.invalidateQueries({ queryKey: ["getAllgateways"] });
        queryClient.invalidateQueries({ queryKey: ["users"], });

      },
      onError: (response: any) => {
        if (response?.status === 422) {
          setErrors(response?.data?.errors || response?.data?.message);
        } else if (response?.status === 409) {
          toast.error(response?.data?.message);
        }
      },
    });

  const { mutateAsync: mutateAddGateway, isPending: isStatusPendingGateway } =
    useMutation({
      mutationKey: ["add-gateway"],
      retry: false,
      mutationFn: async (data: GatewayFormData) => {
        const response = await addGatewayAPI(data);
        return response;
      },
      onSuccess: async () => {
        toast.success("Gateway created successfully!");
        setAddingGatewayRow(null);
        setGatewayFormData({
          title: "",
          location_id: 0,
          user_id: userId,
          status: "ACTIVE",
        });
        setGatewayErrormessage("");
        setIsRefetching(true);
        const updatedData = await refetch();
        setIsRefetching(false);
        queryClient.invalidateQueries({ queryKey: ["userLocations"], });

        if (updatedData.data) {
          const updatedLocation = updatedData.data.find(
            (loc: Location) => loc.id === gatewayFormData.location_id
          );
          if (updatedLocation) {
            setSelectedLocation(updatedLocation);
          }
        }
      },
      onError: (response: any) => {
        if (response?.status === 422) {
          setGatewayErrors(response?.data?.errors || response?.data?.message);
          setGatewayErrormessage("");
        } else if (response?.status === 409) {
          toast.error(response?.data?.message);
          setGatewayErrors({});
        }
      },
    });

  const { mutateAsync: mutateUpdateGateway, isPending: isStatusPendingUpdate } =
    useMutation({
      mutationKey: ["update-gateway"],
      retry: false,
      mutationFn: async (data: GatewayFormData) => {
        if (!data.id) throw new Error("Gateway ID is required for update");
        const payload = {
          title: data.title,
          status: data.status,
        };
        const response = await updateGatewayAPI(payload, data.id);
        return response;
      },
      onSuccess: async () => {
        toast.success("Gateway updated successfully!");
        setEditingGatewayId(null);
        setGatewayFormData({
          title: "",
          location_id: 0,
          user_id: userId,
          status: "ACTIVE",
        });
        setGatewayErrormessage("");
        setIsRefetching(true);
        const updatedData = await refetch();
        setIsRefetching(false);

        if (updatedData.data) {
          const updatedLocation = updatedData.data.find(
            (loc: Location) => loc.id === gatewayFormData.location_id
          );
          if (updatedLocation) {
            setSelectedLocation(updatedLocation);
          }
        }
      },
      onError: (response: any) => {
        if (response?.status === 422) {
          setGatewayErrors(response?.data?.errors || response?.data?.message);
          setGatewayErrormessage("");
        } else if (response?.status === 409) {
          toast.error(response?.data?.message);
          setGatewayErrors({});
        }
      },
    });

  const { mutateAsync: mutateDeleteGateway, isPending: isDeletePending } =
    useMutation({
      mutationKey: ["delete-gateway"],
      retry: false,
      mutationFn: async (gatewayId: number) => {
        const response = await deleteGatewayAPI(gatewayId);
        return response;
      },
      onSuccess: async () => {
        toast.success("Gateway deleted successfully!");
        setIsDeleteDialogOpen(false);
        setGatewayToDelete(null);
        setIsRefetching(true);
        const updatedData = await refetch();
        setIsRefetching(false);

        if (updatedData.data) {
          const updatedLocation = updatedData.data.find(
            (loc: Location) => loc.id === selectedLocation?.id
          );
          if (updatedLocation) {
            setSelectedLocation(updatedLocation);
          }
        }
      },
      onError: (response: any) => {
        toast.error(response?.data?.message);
        setIsDeleteDialogOpen(false);
        setGatewayToDelete(null);
      },
    });


  const handleAddLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingLocation(true);
    setAddingGatewayRow(null);
    setEditingGatewayId(null);
    setGatewayFormData({
      title: "",
      location_id: 0,
      user_id: Number(userId),
      status: "ACTIVE",
    });
    setGatewayErrors({});
    setGatewayErrormessage("");
  };

  const handleAddGateway = (e: React.MouseEvent, locationId: number) => {
    e.stopPropagation();
    setAddingGatewayRow(locationId);
    setEditingGatewayId(null);
    setGatewayFormData({
      title: "",
      location_id: locationId,
      user_id: Number(userId),
      status: "ACTIVE",
    });
    setGatewayErrors({});
    setGatewayErrormessage("");
    setIsAddingLocation(false);
    setFormData({ title: "", user_id: userId, gateway_title: "", location_coordinates: { lat: 0, lng: 0 } });
    setErrors({});
    setErrormessage("");
  };

  const handleCancelAddLocation = (e: any) => {
    e.stopPropagation();
    setIsAddingLocation(false);
    setFormData({ title: "", user_id: userId, gateway_title: "", location_coordinates: { lat: 0, lng: 0 } });
    setErrors({});
    setErrormessage("");
  };

  const handleCancelAddGateway = (e: any) => {
    e.stopPropagation();
    setAddingGatewayRow(null);
    setGatewayFormData({
      title: "",
      location_id: 0,
      user_id: userId,
      status: "ACTIVE",
    });
    setGatewayErrors({});
    setGatewayErrormessage("");
  };

  const handleCancelEditGateway = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGatewayId(null);
    setGatewayFormData({
      title: "",
      location_id: 0,
      user_id: userId,
      status: "ACTIVE",
    });
    setGatewayErrors({});
    setGatewayErrormessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (value !== "" && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleGatewayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGatewayFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (gatewayErrors[name]) {
      setGatewayErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    if (gatewayErrormessage) {
      setGatewayErrormessage("");
    }
  };

  const handleSubmitNewLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const payload = {
        ...formData,
        user_id: Number(formData.user_id),
        gateway_title:
          formData.gateway_title === "" ? null : formData.gateway_title,
      };
      await mutateAddLocation(payload);
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleSubmitNewGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await mutateAddGateway(gatewayFormData);
    } catch (error) {
      console.error("Error adding Gateway:", error);
    }
  };

  const handleSubmitUpdateGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await mutateUpdateGateway(gatewayFormData);
    } catch (error) {
      console.error("Error updating Gateway:", error);
    }
  };


  const toggleGatewayExpand = (gatewayId: number) => {
    setExpandedGateway(expandedGateway === gatewayId ? null : gatewayId);
  };

  const handleEditGateway = (gatewayId: number) => {
    if (!selectedLocation) {
      console.warn("No location selected, cannot edit gateway.");
      return;
    }

    const gatewayToEdit = selectedLocation.gateways.find(
      (g) => g.id === gatewayId
    );
    if (gatewayToEdit) {
      setEditingGatewayId(gatewayId);
      setAddingGatewayRow(null);
      setGatewayFormData({
        id: gatewayId,
        title: gatewayToEdit.title,
        location_id: selectedLocation.id,
        user_id: userId,
        status: "ACTIVE",
      });
      setGatewayErrors({});
      setGatewayErrormessage("");
    } else {
      console.warn(`Gateway with id ${gatewayId} not found.`);
    }
  };

  const handleDeleteGateway = (gatewayId: number) => {
    setGatewayToDelete(gatewayId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (gatewayToDelete !== null) {
      try {
        await mutateDeleteGateway(gatewayToDelete);
      } catch (error) {
        console.error("Error deleting gateway:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setGatewayToDelete(null);
  };

  return (
    <div className="w-full flex bg-white overflow-auto border-l">
      <div className="w-custom_70per flex flex-col ">
        <Tabs
          searchString={searchString}
          setSearchString={setSearchString}
          title="Search Location"
        />

        {(!isLoading && !isRefetching) ? (
          <>
            <div className="flex justify-between items-center m-2 p-1">
              <h2 className="text-sm 3xl:text-base text-black font-medium">
                {isAddingLocation ? "Add Location" : "Locations"}
              </h2>
              {!isAddingLocation && (
                <Button
                  onClick={handleAddLocation}
                  disabled={isAddingLocation}
                  className="h-7 px-4 text-white bg-green-500  text-xs 3xl:text-sm font-normal hover:bg-green-600 rounded-md"
                >
                  + Add Location
                </Button>
              )}
            </div>

            {isAddingLocation ? (
              <AddLocation
                handleSubmitNewLocation={handleSubmitNewLocation}
                errors={errors}
                formData={formData}
                handleChange={handleChange}
                handleCancelAddLocation={handleCancelAddLocation}
                isStatusPending={isStatusPending}
                errormessage={errormessage}
                setFormData={setFormData}
                setErrors={setErrors}
              />
            ) : gatewayData && gatewayData.length > 0 ? (
              <GateWaySettings
                gatewayData={gatewayData}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                handleAddGateway={handleAddGateway}
                editingGatewayId={editingGatewayId}
                gatewayFormData={gatewayFormData}
                handleGatewayChange={handleGatewayChange}
                isStatusPendingUpdate={isStatusPendingUpdate}
                handleCancelEditGateway={handleCancelEditGateway}
                expandedGateway={expandedGateway}
                gatewayErrormessage={gatewayErrormessage}
                isStatusPendingGateway={isStatusPendingGateway}
                handleEditGateway={handleEditGateway}
                toggleGatewayExpand={toggleGatewayExpand}
                gatewayErrors={gatewayErrors}
                handleDeleteGateway={handleDeleteGateway}
                handleCancelAddGateway={handleCancelAddGateway}
                addingGatewayRow={addingGatewayRow}
                handleSubmitNewGateway={handleSubmitNewGateway}
                handleSubmitUpdateGateway={handleSubmitUpdateGateway}
              />
            ) : (
              <span className="flex flex-col h-full items-center justify-center space-y-2 text-gray-500 text-sm 3xl:text-base text-center pb-2 ">
                <LocationIcon className="size-10" />
                <span>No locations available.</span>
              </span>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center w-full h-device_graph text-gray-500">
            <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
          </div>

        )}
      </div>
      <DeleteDialog
        openOrNot={isDeleteDialogOpen}
        label="Are you sure you want to delete this gateway?"
        onCancelClick={handleDeleteCancel}
        onOKClick={handleDeleteConfirm}
        deleteLoading={isDeletePending}
        buttonLable="Yes! Delete"
        buttonLabling="Deleting..."
      />
      <div className="w-custom_40per p-3 box-border h-user_devices overflow-auto border-l">
        <Outlet />
      </div>
    </div>
  );
}
