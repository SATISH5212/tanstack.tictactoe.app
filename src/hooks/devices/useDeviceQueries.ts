import { getAllPaginatedDeviceData } from "@/lib/services/devices";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useDevicesQuery(params: {
    search: string;
    pageSize: number;
    deploymentStatus: string;
    deviceStatus: string;
    user?: any;
    location?: any;
    sortBy?: string | null;
    sortType?: string | null;
    pageIndex: number;
}) {
    return useInfiniteQuery({
        queryKey: ["devices", params],
        initialPageParam: params.pageIndex,
        queryFn: async ({ pageParam }) => {
            const response = await getAllPaginatedDeviceData({
                pageIndex: pageParam,
                pageSize: params.pageSize,
                ...(params.search && { search_string: params.search }),
                ...(params.deploymentStatus !== "ALL" && {
                    device_status: params.deploymentStatus,
                }),
                ...(params.deviceStatus !== "ALL" && {
                    status: params.deviceStatus,
                }),
                ...(params.user && { user_id: params.user.id }),
                ...(params.location && { location_id: params.location.id }),
                ...(params.sortBy && { sort_by: params.sortBy }),
                ...(params.sortType && { sort_type: params.sortType }),
            });

            const { records = [], pagination } = response?.data?.data || {};

            return {
                data: records,
                pagination,
            };
        },
        getNextPageParam: (lastPage) =>
            lastPage.pagination?.current_page < lastPage.pagination?.total_pages
                ? lastPage.pagination.current_page + 1
                : undefined,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    });
}
