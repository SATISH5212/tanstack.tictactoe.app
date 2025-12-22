import { getAllPaginatedDeviceData } from "@/lib/services/devices";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useDevicesQuery(params: {
    search: string;
    page_size: number;
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
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getAllPaginatedDeviceData({
                pageIndex: pageParam,
                page_size: params.page_size,
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

            const { records = [], pagination_info } = response?.data?.data || {};
            const startSerial = (pageParam - 1) * 10 + 1;
            const dataWithSerial = records.map((record: any, index: number) => ({
                ...record,
                serial: startSerial + index,
            }));

            return {
                data: dataWithSerial,
                pagination: pagination_info,
            };
        },
        getNextPageParam: (lastPage) => {
            const hasNextPage = lastPage.pagination?.next_page !== null;
            const nextPage = lastPage.pagination?.next_page;
            return hasNextPage ? nextPage : undefined;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    });
}