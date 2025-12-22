export const getInitialDeviceQueryParams = (search: string) => {
    const params = new URLSearchParams(search);
    return {
        searchString: params.get("search_string") || "",
        deviceStatus: params.get("status") || "ALL",
        deploymentStatus: params.get("device_status") || "ALL",
        pageIndex: Number(params.get("current_page")) || 1,
        pageSize: Number(params.get("page_size")) || 20,
        sortBy: params.get("sort_by"),
        sortType: params.get("sort_type"),
    };
};
