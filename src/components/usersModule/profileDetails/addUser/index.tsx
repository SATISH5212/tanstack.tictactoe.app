import LoadingComponent from "src/components/core/Loading";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import {
  createUserAPI,
  getSingleUserAPI,
  updateUserAPI,
} from "src/lib/services/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import BackArrow from "@/components/icons/BackButton";
import { useUserDetails } from "@/lib/helpers/userpermission";

export const AddUser = ({
  onClose,
  isDialog = false,
  referredBy,
  editingUser,
  isProfileEdit = false,
  setTableLoading,
}: any) => {
  const queryClient = useQueryClient();
  const { userId } = useUserDetails();
  const isEditMode = !!editingUser?.id;

  const initialFormData = {
    full_name: "",
    user_type: "",
    phone: "",
    email: "",
    referred_by: Number(referredBy || userId),
  };
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState<any>(initialFormData);
  const hasSetInitialData = useRef(false);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        full_name: editingUser.full_name || "",
        user_type: editingUser.user_type || null,
        phone: editingUser.phone || "",
        email: editingUser.email || "",
        referred_by: Number(referredBy || userId),
      });
    }
  }, [editingUser]);

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", editingUser?.id],
    queryFn: async () => {
      const response = await getSingleUserAPI(editingUser?.id);
      return response?.data?.data;
    },
    enabled: isEditMode,
    refetchOnMount: "always",
    select: (data) => {
      const transformedData = {
        full_name: data?.full_name || "",
        user_type: data?.user_type || "",
        phone: data?.phone || "",
        email: data?.email || "",
        referred_by: Number(referredBy || userId),
      };
      if (isEditMode && !hasSetInitialData.current) {
        setFormData(transformedData);
        hasSetInitialData.current = true;
      }
      return transformedData;
    },
  });

  useEffect(() => {}, [formData]);
  const { mutateAsync: mutateUser, isPending: isStatusPending } = useMutation({
    mutationKey: [isEditMode ? "update_user" : "create_user"],
    retry: false,
    mutationFn: async (data: any) => {
      const response = isEditMode
        ? await updateUserAPI(data, editingUser.id)
        : await createUserAPI(data);
      return response;
    },
    onSuccess: async () => {
      toast.success(`User ${isEditMode ? "updated" : "created"} successfully!`);
      setTableLoading?.(true);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      try {
        await queryClient.invalidateQueries({ queryKey: ["profileData"] });
      } finally {
        setTableLoading?.(false);
      }
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["user", editingUser.id] });
      }
      onClose();
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

  const handleChange = (e: any) => {
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors({});

    const submissionData: any = {
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      referred_by: formData.referred_by,
      user_type: formData.user_type ? formData.user_type : null,
    };

    if (isEditMode && isProfileEdit) {
      submissionData.email = formData.email;
    }

    try {
      await mutateUser(submissionData);
    } catch (error) {}
  };
  const handleBack = () => {
    onClose();
  };
  if (isDialog) {
    return (
      <>
        {isEditMode && isUserLoading ? (
          <div className=" flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-medium text-gray-700">
                {isEditMode ? "Edit User" : "Add User"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="space-y-1">
                  <Label
                    htmlFor="full_name"
                    className="text-sm font-normal text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full px-3 py-2 border text-sm font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                    type="text"
                    name="full_name"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                {errors?.full_name && (
                  <span className="text-red-500 text-xs">   
                    {errors.full_name}
                  </span>
                )}
              </div>

              {(!isEditMode || !isProfileEdit) && (
                <div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="user_type"
                      className="text-sm font-normal text-gray-700"
                    >
                      User Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.user_type}
                      onValueChange={handleUserTypeChange}
                    >
                      <SelectTrigger className="w-full px-3 py-2 border text-sm font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white focus:outline-none">
                        <SelectItem
                          value="MANAGER"
                          className="focus:bg-gray-100 data-[highlighted]:bg-gray-100 data-[state=checked]:bg-gray-200 cursor-pointer"
                        >
                          Manager
                        </SelectItem>
                        <SelectItem
                          value="SUPERVISOR"
                          className="focus:bg-gray-100 data-[highlighted]:bg-gray-100 data-[state=checked]:bg-gray-200 cursor-pointer"
                        >
                          Supervisor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {errors?.user_type && (
                    <span className="text-red-500 text-xs">
                      {errors.user_type}
                    </span>
                  )}
                </div>
              )}

              <div>
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-sm font-normal text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full px-3 py-2 border text-sm font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors?.email && (
                  <span className="text-red-500 text-xs">{errors.email}</span>
                )}
              </div>

              <div>
                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-normal text-gray-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full px-3 py-2 border text-sm font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors?.phone && (
                  <span className="text-red-500 text-xs">{errors.phone}</span>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isStatusPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={isStatusPending}
                >
                  {isStatusPending
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                      ? "Update"
                      : "Save"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-EEEEF6 px-custom_35per">
      {isEditMode && isUserLoading ? (
        <LoadingComponent key="loader" loading={true} />
      ) : (
        <div key="form" className="w-full max-w-md">
          <div className="py-2 text-gray-500 flex items-center gap-2 mb-2">
            <Button
              onClick={handleBack}
              className="bg-transparent hover:bg-transparent p-0 h-fit"
            >
              <BackArrow className="w-5 h-5 text-black" />
            </Button>
            <span>{isEditMode ? "Edit User" : "Add User"}</span>
          </div>
          <div className="bg-white rounded-2xl px-6 py-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="space-y-1">
                  <Label
                    htmlFor="full_name"
                    className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full px-3 py-2 border text-smd 3xl:text-base font-lexend font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                    type="text"
                    name="full_name"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                {errors?.full_name && (
                  <span className="text-red-500 text-xs">
                    {errors.full_name}
                  </span>
                )}
              </div>

              {(!isEditMode || !isProfileEdit) && (
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
                      <SelectTrigger className="w-full px-3 py-2 border text-smd 3xl:text-base font-lexend font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors?.user_type && (
                    <span className="text-red-500 text-xs">
                      {errors.user_type}
                    </span>
                  )}
                </div>
              )}

              <div>
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full px-3 py-2 border text-smd 3xl:text-base font-lexend font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors?.email && (
                  <span className="text-red-500 text-xs">{errors.email}</span>
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
                    className="w-full px-3 py-2 border text-smd 3xl:text-base font-lexend font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors?.phone && (
                  <span className="text-red-500 text-xs">{errors.phone}</span>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  className="px-4 py-1 bg-white text-gray-700 rounded-lg hover:bg-white transition-colors border border-gray-200"
                  onClick={handleBack}
                  disabled={isStatusPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-1 bg-primary text-white rounded-lg hover:bg-05A155 transition-colors"
                  disabled={isStatusPending}
                >
                  {isStatusPending
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                      ? "Update"
                      : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
