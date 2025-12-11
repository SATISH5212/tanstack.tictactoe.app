import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { User } from "src/lib/interfaces/users";
import { addSerial } from "src/lib/services/addSerial";
import { deleteUserAPI, getAllUsersAPI } from "src/lib/services/users";
import DeleteDialog from "../core/DeleteDialog";
import SearchFilter from "../core/SearchFilter";
import TanStackTable from "../core/TanstackTable";
import { Button } from "../ui/button";
import UserColumns from "./UserColumns";


const GetAllUsers = () => {
  const queryClient = useQueryClient();
  const { user_id, pond_id, motor_id } = useParams({ strict: false });
  const router = useRouter();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const [searchString, setSearchString] = useState<string>(
    searchParams.get("search_string") || ""
  );
  const [debounceSearchString, setDebounceSearchString] = useState<string>(
    searchParams.get("search_string") || ""
  );
  const observer = useRef<IntersectionObserver | null>(null);
  const [deleteUserObj, setDeleteUserObj] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [initialNavigationDone, setInitialNavigationDone] =
    useState<boolean>(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["users", debounceSearchString],
    queryFn: async ({ pageParam = 1 }) => {
      const onDevices = pathname.includes("/devices");

      const queryParamsForAPI: any = {
        ...(debounceSearchString && { search_string: debounceSearchString }),
        page: pageParam,
        ...(!onDevices && {
          starter_id: Number(searchParams.get("starter_id")),
        }),
        limit: 25,
      };

      const queryParamsForURL: any = {
        ...(debounceSearchString && { search_string: debounceSearchString }),
        ...(!onDevices && {
          starter_id: Number(searchParams.get("starter_id")),
        }),
      };

      if (!onDevices) {
        router.navigate({
          to: location.pathname,
          search: queryParamsForURL,
        });
      }
      const response = await getAllUsersAPI(queryParamsForAPI);
      const { data: users, pagination } = response?.data?.data;
      return {
        data: addSerial(users, pagination.current_page, pagination.page_size),
        pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { mutate: deleteUser, isPending: isDeletePending } = useMutation({
    mutationFn: (userId: number) => deleteUserAPI(userId),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteUserObj(null);
      queryClient.invalidateQueries({
        queryKey: ["users", debounceSearchString],
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Failed to delete user");
    },
    retry: false,
  });

  const onDeleteUser = (user: User) => {
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

  const userColumns = UserColumns({ onDeleteUser });

  const usersData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchString !== debounceSearchString) {
        setDebounceSearchString(searchString);
        const currentSearchParams = new URLSearchParams(location.search);
        if (searchString) {
          currentSearchParams.set("search_string", searchString);
        } else {
          currentSearchParams.delete("search_string");
        }
        navigate({
          to: location.pathname,
          search: (prev:any) => ({
            ...prev,
            search_string: searchString || undefined,
          }),
          replace: true,
        });
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchString]);

  useEffect(() => {
    if (!data || initialNavigationDone) return;
    const isOnDevices = pathname.includes("/devices");
    if (isOnDevices) {
      setInitialNavigationDone(true);
      return;
    }
    const firstUser = data?.pages?.[0]?.data?.[0];
    const firstUserId = user_id || firstUser?.id;
    if (!firstUserId) return;
    const starterId = Number(searchParams.get("starter_id"));
    let newPath = `/users/${firstUserId}/ponds`;
    if (motor_id) {
      newPath = `/users/${firstUserId}/ponds/${pond_id}/motors/${motor_id}`;
    }
    router.navigate({
      to: newPath,
      search: {
        starter_id: starterId || undefined,
        search_string: debounceSearchString || undefined,
      },
    });
    setInitialNavigationDone(true);
  }, [data, initialNavigationDone, user_id, pathname, debounceSearchString]);

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
          root: document.querySelector(".scrollbar"),
          threshold: 0.5,
        }
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleAddUser = () => {
    navigate({ to: "/users/add" });
  };

  return (
    <div className="text-xs bg-gray-100 text-black h-full">
      <div className="flex justify-start w-dvw h-full">
        <div className="w-custom_15per overflow-y-auto scrollbar-hidden bg-white p-3 pb-0 box-border">
          <div className="flex items-center justify-between gap-3 pb-4">
            <div className="w-custom_95per h-full border border-slate-200 rounded-md overflow-hidden">
              <SearchFilter
                searchString={searchString}
                setSearchString={setSearchString}
                title="Search users"
                className="h-full w-full"
              />
            </div>
            <Button
              className="py-2 px-2 h-7 hover:bg-green-600 bg-green-500 flex items-center justify-center text-white text-xs 3xl:text-sm cursor-pointer rounded-md"
              onClick={handleAddUser}
            >
              <span className="font-normal text-xs">+ Add</span>
            </Button>
          </div>
          <div
            id="usersTable"
            className="relative"
            style={{ overflow: "visible" }}
          >
            <TanStackTable
              data={usersData}
              columns={userColumns}
              loading={isFetching || isFetchingNextPage}
              removeSortingForColumnIds={["serial", "actions", "full_name"]}
              lastRowRef={lastRowRef}
              isFetchingNextPage={isFetchingNextPage}
              heightClass="h-tableheght"
            />
          </div>
        </div>
        <div className="w-custom_85per bg-white">
          <Outlet />
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
  );
};

export default GetAllUsers;
