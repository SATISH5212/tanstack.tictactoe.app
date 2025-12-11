import AddUser from "@/components/usersModule/profileDetails/addUser";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import LoadingComponent from "src/components/core/Loading";
import BackArrow from "src/components/icons/BackButton";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  createUserAPI,
  getSingleUserAPI,
  updateUserAPI,
} from "src/lib/services/users";

export const UserForm = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user_id: userId } = useParams({ strict: false }) || {};
  const isEditMode = !!userId;
  const { getUserId, isAdmin } = useUserDetails();
  const currentUserId = getUserId();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const initialFormData = {
    full_name: "",
    email: "",
    gender: "",
    address: "",
    phone: "",
    alternate_phone: "",
    alternate_phone_1: "",
    alternate_phone_2: "",
    alternate_phone_3: "",
    alternate_phone_4: "",
  };

  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState<any>(initialFormData);
  const hasSetInitialData = useRef(false);

  useEffect(() => {
    setFormData(initialFormData);
    hasSetInitialData.current = false;
  }, [userId]);

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await getSingleUserAPI(userId);
      return response?.data?.data;
    },
    enabled: isEditMode,
    refetchOnMount: "always",
    select: (data) => {
      const transformedData = {
        full_name: data?.full_name || "",
        email: data?.email || "",
        gender: data?.gender || "",
        address: data?.address || "",
        phone: data?.phone || "",
        alternate_phone: data?.alternate_phone || "",
        alternate_phone_1: data?.alternate_phone_1 || "",
        alternate_phone_2: data?.alternate_phone_2 || "",
        alternate_phone_3: data?.alternate_phone_3 || "",
        alternate_phone_4: data?.alternate_phone_4 || "",
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
        ? await updateUserAPI(data, userId)
        : await createUserAPI(data);
      return response;
    },
    onSuccess: () => {
      toast.success(`User ${isEditMode ? "updated" : "created"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["user", userId] });
      }
      navigate({ to: "/users" });
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
          } else if (errorMessages.toLowerCase().startsWith("email")) {
            setErrors({ email: errorMessages });
          } else if (
            errorMessages.toLowerCase().startsWith("alternate_phone")
          ) {
            const fieldMatch = errorMessages.match(/alternate_phone(_\d)?/i);
            if (fieldMatch) {
              setErrors({ [fieldMatch[0]]: errorMessages });
            } else {
              setErrors({ alternate_phone: errorMessages });
            }
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
    if (name === "phone" || name.startsWith("alternate_phone")) {
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: sanitizedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors({});

    const submissionData = {
      ...formData,
      ...(!isAdmin()
        ? { user_type: isEditMode ? formData.user_type : "OWNER" }
        : { user_type: "OWNER" }),
      created_by: getUserId(),
      alternate_phone:
        formData.alternate_phone.trim() === ""
          ? null
          : formData.alternate_phone,
      alternate_phone_1:
        formData.alternate_phone_1.trim() === ""
          ? null
          : formData.alternate_phone_1,
      alternate_phone_2:
        formData.alternate_phone_2.trim() === ""
          ? null
          : formData.alternate_phone_2,
      alternate_phone_3:
        formData.alternate_phone_3.trim() === ""
          ? null
          : formData.alternate_phone_3,
      alternate_phone_4:
        formData.alternate_phone_4.trim() === ""
          ? null
          : formData.alternate_phone_4,
    };

    try {
      await mutateUser(submissionData);
    } catch (error) {}
  };

  const handleBack = () => navigate({ to: "/users" });

  const handleOpenAddUserDialog = () => {
    setIsAddUserDialogOpen(true);
  };

  const handleCloseAddUserDialog = () => {
    setIsAddUserDialogOpen(false);
  };

  return (
    <div className="h-[93dvh] overflow-auto bg-EEEEF6 px-custom_35per">
      {isEditMode && isUserLoading ? (
        <LoadingComponent loading={true} />
      ) : (
        <div className="w-full max-w-3xl mb-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBack}
              className="bg-transparent hover:bg-transparent p-0 "
            >
              <BackArrow className="!w-5 !h-5 text-black font-semibold" />
            </Button>
            <span className="fond-semibold">{isEditMode ? "Edit User" : "Add User"}</span>
          </div>
          <div className="bg-white rounded-2xl px-6 py-1">
            <form onSubmit={handleSubmit} className="space-y-5 bg-white mt-8">
              {/* <div className="flex justify-end mt-3 ">
                {isEditMode && (
                  <Button
                    type="button"
                    onClick={handleOpenAddUserDialog}
                    className="bg-primary text-white hover:bg-05A155 p-2 h-7 "
                  >
                     + Add User
                  </Button>
                )}
              </div> */}
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
                    type="text"
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
              <div className="space-y-1">
                <Label className="text-smd 3xl:text-base font-lexend font-normal text-gray-700">
                  Alternate Phone Numbers
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    "alternate_phone",
                    "alternate_phone_1",
                    "alternate_phone_2",
                  ].map((field, index) => (
                    <div key={field} className="space-y-1">
                      <Input
                        className="w-full px-3 py-2 border text-smd 3xl:text-base font-lexend font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                        type="text"
                        name={field}
                        placeholder={`Alternate Phone ${index + 1}`}
                        value={formData[field]}
                        onChange={handleChange}
                        maxLength={10}
                      />
                      {errors?.[field] && (
                        <span className="text-red-500 text-xs">
                          {errors[field]}
                        </span>
                      )}
                    </div>
                  ))}
                  {["alternate_phone_3", "alternate_phone_4"].map(
                    (field, index) => (
                      <div key={field} className="space-y-1">
                        <Input
                          className="w-full px-3 py-2 border text-smd 3xl:text-base font-lexend font-normal border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50"
                          type="text"
                          name={field}
                          placeholder={`Alternate Phone ${index + 4}`}
                          value={formData[field]}
                          onChange={handleChange}
                          maxLength={10}
                        />
                        {errors?.[field] && (
                          <span className="text-red-500 text-xs">
                            {errors[field]}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="address"
                  className="text-smd 3xl:text-base font-lexend font-normal text-gray-700"
                >
                  Address
                </Label>
                <textarea
                  className="w-full px-3 py-2 text-smd 3xl:text-base font-lexend font-normal border border-gray-200 rounded-lg focus-visible:ring-0 bg-gray-50 resize-none h-16"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3 pb-3">
                <Button
                  type="button"
                  className="px-4  bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => navigate({ to: "/users" })}
                  disabled={isStatusPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-5  bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AddUser
            onClose={handleCloseAddUserDialog}
            isDialog={true}
            editingUser={null}
            referredBy={userId || currentUserId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
