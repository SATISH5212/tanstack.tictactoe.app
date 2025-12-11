import { IGateWaySettingsBlock } from "src/lib/interfaces/users";

import { CircleCheck, CircleX, MoreVertical } from "lucide-react";
import { FC, useState } from "react";
import GatewayDelete from "../icons/users/gateway/GatewayDelete";
import GatewayEdit from "../icons/users/gateway/GatewayEdit";
import GatewayHide from "../icons/users/gateway/GatewayHide";
import GatewayView from "../icons/users/gateway/GatewayView";
import { GatewayIcon } from "../svg/GatewayIcon";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { DeleteDeviceIcon } from "../svg/DeletePond";
import DeleteDialog from "../core/DeleteDialog";
import { deleteLocationAPI } from "@/lib/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const GateWaySettings: FC<IGateWaySettingsBlock> = (props) => {
  const {
    gatewayData,
    selectedLocation,
    setSelectedLocation,
    handleAddGateway,
    editingGatewayId,
    gatewayFormData,
    handleGatewayChange,
    isStatusPendingUpdate,
    handleCancelEditGateway,
    expandedGateway,
    gatewayErrormessage,
    isStatusPendingGateway,
    handleEditGateway,
    toggleGatewayExpand,
    gatewayErrors,
    handleDeleteGateway,
    handleCancelAddGateway,
    addingGatewayRow,
    handleSubmitNewGateway,
    handleSubmitUpdateGateway,
  } = props;

  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);

  
  const { mutate: deleteLocation, isPending: isDeletingLocationPending } =
    useMutation({
      mutationFn: (locationId: number) => deleteLocationAPI(locationId),
      onSuccess: () => {
        toast.success("Location deleted successfully!");
        setDeleteLocationId(null);
        queryClient.invalidateQueries({ queryKey: ["getAllgateways"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        
      },
      onError: (error: any) => {
        if (error?.status === 409) {
          toast.error(error?.data?.message);
        } else {
          toast.error(error?.data?.message || "Failed to delete location.");
        }
      },
      retry: false,
    });

  const handleDelete = (e: React.MouseEvent, locationId: number) => {
    e.stopPropagation();
    setDeleteLocationId(locationId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteLocationId) {
      toast.error("Invalid location selection");
      return;
    }
    deleteLocation(deleteLocationId);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteLocationId(null);
  };

  return (
    <div className="flex border rounded-custom_001010 mx-2">
      <div className="w-1/4 border-r  h-full">
        <ul className=" h-[calc(100vh-150px)] overflow-y-auto">
          {gatewayData.map((location: any) => (
            <li
              key={location?.id}
              onClick={() => setSelectedLocation(location)}
              className={`p-2 py-3 cursor-pointer flex items-center justify-between space-x-2 !font-inter rounded-none border-black/20 border-b last:border-none ${
                selectedLocation?.id === location?.id
                  ? "bg-green-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <span
                className="text-smd 3xl:text-base text-black w-full truncate"
                title={
                  location?.title
                    ? location.title.charAt(0).toUpperCase() +
                      location.title.slice(1).toLowerCase()
                    : ""
                }
              >
                {location?.title
                  ? location.title.charAt(0).toUpperCase() +
                    location.title.slice(1).toLowerCase()
                  : ""}
              </span>
              <button
                className="text-gray-500 hover:text-red-500"
                onClick={(e) => handleDelete(e, location?.id)}
              >
                <DeleteDeviceIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4">
        {selectedLocation ? (
          <>
            <div className="flex justify-between items-center py-3">
              <h2 className="text-xs font-basetext-xs 3xl:text-base text-black font-medium pl-2">
                Gateways
              </h2>
              <Button
                onClick={(e) => handleAddGateway(e, selectedLocation?.id)}
                className="text-red-500 bg-transparent border-none hover:bg-transparent hover:text-red-500 h-4 p-0 pr-2 text-xs 3xl:text-sm font-medium"
              >
                + Add New Gateway
              </Button>
            </div>

            {selectedLocation?.gateways?.length > 0 ? (
              <div>
                {selectedLocation.gateways.map((gateway) => (
                  <div key={gateway?.id} className="border rounded-br-lg ">
                    {editingGatewayId === gateway.id ? (
                      <>
                        <form
                          onSubmit={handleSubmitUpdateGateway}
                          className="flex items-center gap-4 pr-2"
                        >
                          <div className="flex-1">
                            <Input
                              name="title"
                              value={gatewayFormData.title}
                              onChange={handleGatewayChange}
                              placeholder="Gateway Title"
                              className="!text-smd !3xl:text-base rounded-none bg-blue-50 p-2 border-0 shadow-none outline-none focus:outline-none focus-visible:outline-none !focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-none h-8"
                              maxLength={30}
                            />
                          </div>

                          <div className="flex gap-2 items-center">
                            <Button
                              className="bg-green-500 hover:bg-green-600 border border-green-500 text-white p-1 h-fit"
                              type="submit"
                              disabled={isStatusPendingUpdate}
                            >
                              <CircleCheck className="size-3" />
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white p-1 h-fit"
                              onClick={handleCancelEditGateway}
                            >
                              <CircleX className="size-3" />
                            </Button>
                          </div>
                        </form>
                        {gatewayErrors?.title && (
                          <p className="text-red-500 text-xs">
                            {gatewayErrors?.title}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          className={`flex justify-between items-center ${expandedGateway === gateway.id ? "bg-white" : "bg-gray-100"}  px-2 py-1.5 rounded-none`}
                        >
                          <span className="text-smd 3xl:text-base">
                            {gateway?.title}
                          </span>
                          <div className="flex items-center">
                            <Button
                              onClick={() => toggleGatewayExpand(gateway.id)}
                              className={`mr-2   text-sm ${expandedGateway === gateway.id ? " bg-gray-100 hover:bg-gray-100 text-black" : "bg-6A7185 hover:bg-6A7185 !text-white"} h-6 py-1 px-3 rouned-sm !text-xxs !3xl:text-xs  flex gap-1 bg-transparent hover:bg-transparent border border-black/40 text-black`}
                            >
                              {expandedGateway === gateway.id ? (
                                <GatewayHide className=" !size-3" />
                              ) : (
                                <GatewayView className=" !size-3" />
                              )}
                              {expandedGateway === gateway.id ? "Hide" : "View"}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-fit w-fit px-1 hover:bg-transparent"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => handleEditGateway(gateway.id)}
                                  className="cursor-pointer"
                                >
                                  <GatewayEdit className=" !size-4 " />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteGateway(gateway.id)
                                  }
                                  className="cursor-pointer"
                                >
                                  <GatewayDelete className=" !size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {expandedGateway === gateway.id && (
                          <div className=" p-2">
                            {gateway?.starter_boxes?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {gateway?.starter_boxes?.map((box) => (
                                  <Badge
                                    key={box?.id}
                                    variant="outline"
                                    className="text-black px-1 py-1 bg-14A0DB33 mb-1 w-fit text-xs 3xl:text-sm"
                                  >
                                    <span className="bg-white px-1 rounded-custom_100010">
                                      {box?.title}
                                    </span>
                                    <span className="bg-white h-1  px-2"></span>
                                    <span className="bg-white  px-1 rounded-custom_010100">
                                      {box?.mcu_serial_no}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center text-sm 3xl:text-base ">
                                No starter boxes connected.
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {addingGatewayRow === selectedLocation?.id && (
                  <form onSubmit={handleSubmitNewGateway} className=" p-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          name="title"
                          value={gatewayFormData.title}
                          onChange={handleGatewayChange}
                          placeholder="Gateway Title"
                          className="text-sm rounded-none bg-blue-50 p-2 border-0 shadow-none outline-none focus:outline-none focus-visible:outline-none !focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-none h-9"
                          maxLength={30}
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button
                          className="bg-green-500 hover:bg-green-600 border border-green-500 text-white p-1 h-fit"
                          type="submit"
                          disabled={isStatusPendingGateway}
                        >
                          <CircleCheck className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white p-1 h-fit"
                          onClick={handleCancelAddGateway}
                        >
                          <CircleX className="size-3" />
                        </Button>
                      </div>
                    </div>
                    {gatewayErrors?.title && (
                      <p className="text-red-500 text-xs">
                        {gatewayErrors?.title}
                      </p>
                    )}
                    {gatewayErrormessage && (
                      <p className="text-red-500 text-xs pt-1 text-left">
                        {gatewayErrormessage}
                      </p>
                    )}
                  </form>
                )}
              </div>
            ) : addingGatewayRow === selectedLocation?.id ? (
              <form onSubmit={handleSubmitNewGateway} className=" p-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      name="title"
                      value={gatewayFormData.title}
                      onChange={handleGatewayChange}
                      placeholder="Gateway Title"
                      className="text-sm rounded-none bg-blue-50 p-2 border-0 shadow-none outline-none focus:outline-none focus-visible:outline-none !focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-none h-9"
                      maxLength={30}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      className="bg-green-500 hover:bg-green-600 border border-green-500 text-white p-1 h-fit"
                      type="submit"
                      disabled={isStatusPendingGateway}
                    >
                      <CircleCheck className="size-3" />
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white p-1 h-fit"
                      onClick={handleCancelAddGateway}
                    >
                      <CircleX className="size-3" />
                    </Button>
                  </div>
                </div>
                {gatewayErrors?.title && (
                  <p className="text-red-500 text-xs">{gatewayErrors?.title}</p>
                )}
                {gatewayErrormessage && (
                  <p className="text-red-500 text-xs pt-1 text-left">
                    {gatewayErrormessage}
                  </p>
                )}
              </form>
            ) : (
              <div className="flex  flex-col items-center justify-center h-[70vh]">
                <GatewayIcon className="h-10 w-10" />
                <p className="text-gray-500 text-xs 3xl:text-base text-center pb-2 ">
                  No gateways available.
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">Please select a location</p>
        )}
      </div>
      <DeleteDialog
        openOrNot={isDeleteDialogOpen}
        label="Are you sure you want to delete this location?"
        onCancelClick={handleDeleteCancel}
        onOKClick={handleDeleteConfirm}
        deleteLoading={isDeletingLocationPending}
        buttonLable="Yes! Delete"
        buttonLabling="Deleting..."
      />
    </div>
  );
};
export default GateWaySettings;
