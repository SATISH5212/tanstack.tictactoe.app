"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { createUserAPI } from "@/lib/services/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "src/components/ui/sheet";
import { addDeviceAPI } from "src/lib/services/deviceses";

const AddDevice = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("addDevice");

  const { userId } = useUserDetails();

  const initialFormData = {
    full_name: "",
    email: "",
    phone: "",
    user_type: "",
    address: "",
    created_by: Number(userId),
  };
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState<any>(initialFormData);
  const initialDeviceData = useMemo(
    () => ({
      name: "",
      mac_address: "",
      pcb_number: "",
      starter_number: "",
    }),
    []
  );
  const [deviceData, setDeviceData] = useState(initialDeviceData);

  const { mutateAsync: mutateAddDevice, isPending: isStatusPending } =
    useMutation({
      mutationKey: ["add-device"],
      retry: false,
      mutationFn: async (data: any) => {
        const response = await addDeviceAPI(data);
        return response;
      },
      onSuccess: useCallback(async () => {
        toast.success("Device Added Successfully");
        setDeviceData(initialDeviceData);
        setErrors({});
        setIsOpen(false);
      }, [initialDeviceData, queryClient]),

      onError: useCallback((error: any) => {
        if (error?.status === 409) {
          const errorMessage = error?.data?.message || "Device already exists";
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        } else if (error?.status === 422) {
          setErrors(error?.data?.errors || {});
        } else {
          toast.error(error?.data?.message);
        }
      }, []),
    });

  const { mutateAsync: mutateUser, isPending: isUserAddPending } = useMutation({
    mutationKey: ["create_user"],
    retry: false,
    mutationFn: async (data: any) => {
      console.log(data, "submit user data");
      const response = await createUserAPI(data);
      return response;
    },
    onSuccess: async () => {
      toast.success(`User  created successfully!`);
      setFormData(initialFormData);
      setErrors({})
      setIsOpen(false);
    },
    onError: (response: any) => {
      const status = response?.status;
      const errorMessages = response?.data?.errors || response?.data?.message;
      if (status === 422) {
        if (typeof errorMessages === "string") {
          toast.error(errorMessages);
          return;
        }
        if (typeof errorMessages === "object") {
          setErrors(errorMessages);
        }
        return;
      }
      if (status === 409 || status === 400 || status === 404) {
        if (typeof errorMessages === "string") {
          if (errorMessages.toLowerCase().startsWith("phone")) {
            setErrors({ phone: errorMessages });
          } else {
            toast.error(errorMessages);
          }
        } else {
          toast.error("Something went wrong");
        }
        return;
      }
      toast.error(
        typeof errorMessages === "string"
          ? errorMessages
          : "An unexpected error occurred"
      );
    },
  });

  const handleDeviceSubmit = useCallback(async () => {
    try {
      const formattedData = {
        ...deviceData,
        name: deviceData.name,
        mac_address: deviceData.mac_address.toUpperCase(),
        pcb_number: deviceData.pcb_number.toUpperCase(),
        starter_number: deviceData.starter_number
          ? deviceData.starter_number.toUpperCase()
          : null,
      };
      await mutateAddDevice(formattedData);
    } catch (error) {
      console.error("Submit Error:", error);
    }
  }, [deviceData, mutateAddDevice]);

  const handleUserSubmit = async () => {
    setErrors({});

    const submissionData: any = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      user_type: formData.user_type ? formData.user_type : null,
      created_by: Number(userId),
    };
    try {
      await mutateUser(submissionData);
    } catch (error) {}
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const alphanumericFields = [
        "name",
        "mac_address",
        "pcb_number",
        "starter_number",
      ];
      let filteredValue = value;
      if (alphanumericFields.includes(name)) {
        filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
      }
      if (name === "name") {
        filteredValue = filteredValue.replace(/\s+/g, " ").trimStart();

        if (filteredValue.length > 0) {
          const isAllCaps = filteredValue === filteredValue.toUpperCase();

          if (isAllCaps) {
            filteredValue = filteredValue;
          } else {
            filteredValue =
              filteredValue.charAt(0).toUpperCase() + filteredValue.slice(1);
          }
        }
      }

      if (name === "mcu_serial_no" && filteredValue) {
        setErrors((prev: Record<string, string | null>) => ({
          ...prev,
          mcu_serial_no: null,
          mac_address: null,
        }));
      } else if (filteredValue && errors[name]) {
        setErrors((prev: Record<string, string | null>) => ({
          ...prev,
          [name]: null,
        }));
      }

      if (name === "mcu_serial_no") {
        const macAddress = filteredValue
          ? filteredValue.match(/.{1,2}/g)?.join(":") || ""
          : "";
        setDeviceData((prev) => ({
          ...prev,
          [name]: filteredValue,
          mac_address: macAddress,
        }));
      } else {
        setDeviceData((prev) => ({
          ...prev,
          [name]:
            name === "gateway_id" || name === "user_id"
              ? filteredValue
                ? Number(filteredValue)
                : null
              : filteredValue,
        }));
      }
    },
    [errors]
  );

  const handleAddUserChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: sanitizedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleUserTypeChange = (value: string) => {
    setFormData({ ...formData, user_type: value });
    if (errors.user_type) {
      setErrors({ ...errors, user_type: "" });
    }
  };

  const handleDrawerClose = () => {
    setErrors({});
    setDeviceData(initialDeviceData);
    setFormData(initialFormData);
    setIsOpen(false);
  };

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    setErrors({});
    if (activeTab === "addDevice") {
      setDeviceData(initialDeviceData);
    }
    if (activeTab === "addUser") {
      setFormData(initialFormData);
    }
  }, [activeTab]);

  return (
    <div className="add-device-container">
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (open !== isOpen) {
            setIsOpen(open);
            if (!open) {
              handleDrawerClose();
            }
          }
        }}
      >
        <SheetTrigger asChild>
          <Button
            onClick={handleOpenModal}
            className="h-7 px-4 bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm cursor-pointer font-normal"
            disabled={isStatusPending}
          >
            <span>+ Add</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per px-6 py-0 font-inter [&>button]:hidden overflow-y-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col pt-2 pb-12 mt-4"
          >
            <TabsList className="flex items-center mb-5 justify-between">
              <div className="flex bg-gray-200 rounded-lg overflow-hidden p-1 shadow-sm">
                <TabsTrigger
                  value="addDevice"
                  className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                    activeTab === "addDevice"
                      ? "bg-blue-400 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Add Device
                </TabsTrigger>

                <TabsTrigger
                  value="addUser"
                  className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${
                    activeTab === "addUser"
                      ? "bg-blue-400 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Add User
                </TabsTrigger>
              </div>

              <button
                className="absolute right-4  hover:bg-red-200 text-red-400 p-1 rounded-full"
                onClick={handleDrawerClose}
              >
                <X size={15} strokeWidth={3} />
              </button>
            </TabsList>

            <TabsContent value="addDevice" className="grid gap-4">
              <div className="grid gap-4 pt-2 pb-12">
                <div className="flex flex-col space-y-1">
                  <Label className="text-smd 3xl:text-base font-lexend font-normal text-gray-700">
                    Device Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                    placeholder="Enter Name"
                    id="name"
                    name="name"
                    value={deviceData.name}
                    onChange={handleChange}
                    maxLength={30}
                  />
                  {errors?.name && (
                    <span className="text-red-500 text-xs font-inter font-light mt-1">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-smd 3xl:text-base font-lexend font-normal text-gray-700">
                    MAC Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mac_address"
                    placeholder="Enter MAC Address"
                    name="mac_address"
                    value={deviceData.mac_address.toUpperCase() || ""}
                    className="font-inter shadow-none border-none bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                    onChange={handleChange}
                  />
                  {errors?.mac_address && (
                    <span className="text-red-500 text-xs font-inter font-light mt-1">
                      {errors.mac_address}
                    </span>
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <Label className="text-smd 3xl:text-base font-lexend font-normal text-gray-700">
                    PCB Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="shadow-none border border-gray-200 rounded-md bg-gray-100 font-inter focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                    placeholder="Enter PCB Number"
                    id="pcb_number"
                    name="pcb_number"
                    value={deviceData.pcb_number.toUpperCase()}
                    onChange={handleChange}
                  />
                  {errors?.pcb_number && (
                    <span className="text-red-500 text-xs font-inter font-light mt-1">
                      {errors.pcb_number}
                    </span>
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <Label className="text-smd 3xl:text-base font-lexend font-normal text-gray-700">
                    Starter Box Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="starter_number"
                    placeholder="Enter Starter Box Number"
                    name="starter_number"
                    value={deviceData.starter_number.toUpperCase()}
                    onChange={handleChange}
                    className="font-inter shadow-none border border-gray-200 bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                  />
                  {errors?.starter_number && (
                    <span className="text-red-500 text-xs font-inter font-light mt-1">
                      {errors.starter_number}
                    </span>
                  )}
                </div>
              </div>
              <SheetFooter className="absolute bottom-2 right-4 py-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleDrawerClose}
                  className="text-center text-sm px-4 h-7 border border-gray-200 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleDeviceSubmit}
                  className="text-center flex justify-center text-sm text-white px-6 h-7 bg-blue-500 hover:bg-blue-600 font-medium"
                  disabled={isStatusPending}
                >
                  {isStatusPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </SheetFooter>
            </TabsContent>

            <TabsContent value="addUser" className="grid gap-4">
              <div className="grid gap-4 pt-2 pb-12">
                <form onSubmit={handleUserSubmit} className="space-y-3">
                  <div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="full_name"
                        className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                        type="text"
                        name="full_name"
                        placeholder="Enter full name"
                        value={formData.full_name}
                        onChange={handleAddUserChange}
                      />
                    </div>
                    {errors?.full_name && (
                      <span className="text-red-500 text-xs">
                        {errors.full_name}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="user_type"
                        className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                      >
                        User Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.user_type}
                        onValueChange={handleUserTypeChange}
                      >
                        <SelectTrigger className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="USER">USER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors?.user_type && (
                      <span className="text-red-500 text-xs">
                        {errors.user_type}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="email"
                        className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                      >
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleAddUserChange}
                      />
                    </div>
                    {errors?.email && (
                      <span className="text-red-500 text-xs">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="phone"
                        className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                        type="text"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleAddUserChange}
                        maxLength={10}
                      />
                    </div>
                    {errors?.phone && (
                      <span className="text-red-500 text-xs">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="phone"
                        className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                      >
                        Address
                      </Label>
                      <Input
                        className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                        type="text"
                        name="address"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={handleAddUserChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <SheetFooter className="absolute bottom-2 right-4 py-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleDrawerClose}
                  className="text-center text-sm px-4 h-7 border border-gray-200 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleUserSubmit}
                  className="text-center flex justify-center text-sm text-white px-6 h-7 bg-blue-500 hover:bg-blue-600 font-medium"
                  disabled={isUserAddPending}
                >
                  {isStatusPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </SheetFooter>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AddDevice;
