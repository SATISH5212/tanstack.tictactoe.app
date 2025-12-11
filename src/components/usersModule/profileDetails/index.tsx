import DeleteDialog from "@/components/core/DeleteDialog";
import SearchFilter from "@/components/core/SearchFilter";
import TanStackTable from "@/components/core/TanstackTable";
import BackArrow from "@/components/icons/BackButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { getViewProfileDetails } from "@/lib/services";
import { deleteUserAPI } from "@/lib/services/users";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddUser } from "./addUser";
import ProfileCard from "./ProfileDetails";
import { UserColumnsList } from "./UsersColumns";
import { UserTypeFilter } from "./UserTypeFilter";

const ViewUserDetails = () => {
  const observer = useRef<IntersectionObserver | null>(null);
  const { isUser, isSupervisor } = useUserDetails();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteUserObj, setDeleteUserObj] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [sortType, setSortType] = useState("");
  const [debounceSearchString, setDebounceSearchString] = useState("");
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [searchString, setSearchString] = useState<string>(
    searchParams.get("search_string") || ""
  );
  const [selectType, setSelectedType] = useState<any>(
    searchParams.get("user_type") || ""
  );
  const [tableLoading, setTableLoading] = useState(false);

  const {
    data,
    isLoading: profileLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchUsers,
  } = useInfiniteQuery({
    queryKey: ["profileData", debounceSearchString, selectType],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = {
        page: pageParam,
        limit: 15,
        ...(debounceSearchString && { search_string: debounceSearchString }),
        ...(sortBy && { sort_by: sortBy }),
        ...(sortType && { sort_type: sortType }),
        ...(selectType && { user_type: selectType }),
      };
      const response = await getViewProfileDetails(queryParams);
      if (response.success) {
        return response.data.data;
      } else {
        throw response;
      }
    },
    initialPageParam: 1,
    enabled: isUser() || isSupervisor(),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination_info) return undefined;
      const { current_page, total_pages } = lastPage.pagination_info;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    staleTime: 300000,
  });

  const profileData = data?.pages?.[0]?.user_details || {};
  const tableData = data?.pages?.flatMap((page) => page.records) || [];

  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        {
          root: null,
          threshold: 0.5,
        }
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const { mutate: deleteUser, isPending: isDeletePending } = useMutation({
    mutationFn: (userId: number) => deleteUserAPI(userId),
    onSuccess: async () => {
      setTableLoading?.(true);
      toast.success("User deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteUserObj(null);
      await refetchUsers();
      setTableLoading?.(false);
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete user");
      setTableLoading?.(false);
    },
    retry: false,
  });

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const onDeleteUser = (user: any) => {
    setDeleteUserObj(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteUserObj) {
      deleteUser(deleteUserObj.id);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteUserObj(null);
  };

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchString(searchString);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchString]);

  useEffect(() => {
    navigate({
      to: location.pathname,
      search: (prev: any) => ({
        ...prev,
        search_string: debounceSearchString || undefined,
        user_type: selectType || undefined,
        sort_by: sortBy || undefined,
        sort_type: sortType || undefined,
      }),
      replace: true,
    });
  }, [debounceSearchString, selectType, sortBy, sortType, navigate]);

  return (
    <div className="bg-gray-100">
      <div className="mx-auto bg-white flex w-full h-[94vh]">
        <div className="m-2 shadow-[0_0_10px_0_rgba(0,0,0,0.1)] rounded-md p-2 w-80">
          <ProfileCard
            profileData={profileData}
            onEdit={() => {
              setEditingUser(profileData);
              setIsEditOpen(true);
            }}
          />
        </div>
        <div className="bg-white rounded-md p-2 w-full">
          <div className="px-7.5 overflow-y-auto">
            <div className="pb-2 flex items-end justify-between">
              <Button
                onClick={handleBack}
                className="bg-transparent hover:bg-transparent p-0 h-fit"
              >
                <BackArrow className="!w-10 !h-6 text-black hover:bg-gray-100 rounded-md" />
              </Button>
              <div className="flex justify-end gap-3">
                <div >
                  <UserTypeFilter
                    onTypeChange={handleTypeChange}
                    selectedType={selectType}
                  />
                </div>
                <SearchFilter
                  searchString={searchString}
                  setSearchString={setSearchString}
                  title="Search user"
                  className="border border-gray-300 rounded-md"
                />
                <div>
                  <Button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 h-8 ml-auto rounded-md font-light text-xs"
                    title="Add User "
                  >
                    + Add User
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-auto relative">
              <div
                id="pondsTable"
                className="relative overflow-auto flex-1 w-full mt-2"
              >
                <TanStackTable
                  columns={UserColumnsList(
                    handleEditUser,
                    onDeleteUser,
                    refetchUsers,
                    setTableLoading
                  )}
                  data={tableData}
                  loading={profileLoading || tableLoading}
                  getData={refetchUsers}
                  lastRowRef={lastRowRef}
                  isFetchingNextPage={isFetchingNextPage}
                  onRowClick={() => {}}
                  onEditUser={handleEditUser}
                  heightClass="h-profileHeight"
                  removeSortingForColumnIds={[
                    "serial",
                    "actions",
                    "user_type",
                    "status",
                    "assign_pond",
                    "location",
                    "assign_location",
                  ]}
                  sortBy={sortBy}
                  sortType={sortType}
                  setSortBy={setSortBy}
                  setSortType={setSortType}
                />
              </div>
              {!hasNextPage && tableData.length > 0 && (
                <div className="text-center text-gray-500 text-sm border-t border-gray-200"></div>
              )}
            </div>
          </div>

          <DeleteDialog
            openOrNot={isDeleteDialogOpen}
            label="Are you sure you want to delete this user? This action will permanently remove the user and all associtted data . Do you want to continue?"
            onCancelClick={handleDeleteCancel}
            onOKClick={handleDeleteConfirm}
            deleteLoading={isDeletePending}
            buttonLable="Yes! Delete"
            buttonLabling="Deleting..."
          />
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto p-0"
          >
            <div className="p-6">
              <AddUser
                onClose={() => {
                  setIsEditOpen(false);
                  setEditingUser(null);
                  refetchUsers();
                }}
                isDialog={true}
                editingUser={editingUser}
                referredBy={profileData?.id}
                setTableLoading={setTableLoading}
                isProfileEdit={editingUser?.id === profileData?.id}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto p-0"
          >
            <div className="p-6">
              <AddUser
                onClose={() => {
                  setIsAddOpen(false);
                  setEditingUser(null);
                  refetchUsers();
                }}
                isDialog={true}
                editingUser={null}
                isProfileEdit={false}
                setTableLoading={setTableLoading}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewUserDetails;
