import { $fetch } from "../fetch";
import { GetAllPaginatedUsersPropTypes } from "../interfaces/devices";
export const getAllPaginatedDeviceData = async ({
  pageIndex,
  page_size,
  search_string,
  device_status,
  user_id,
  location_id,
  sort_by,
  sort_type,
  power,
  status
}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size,
      search_string,
      device_status,
      user_id,
      location_id,
      sort_by,
      sort_type,
      power,
      status
    };
    return await $fetch.get("/starters/web/all", queryParams);
  } catch (err) {
    throw err;
  }
};
export const getSingleDeviceAPI = async (id: string | undefined) => {
  const queryParams = {
  };
  try {
    return await $fetch.get(`/starter/${id}/motors`, queryParams);
  } catch (err) {
    throw err;
  }
};
export const getGatewayTitleAPI = async () => {
  try {
    return await $fetch.get(`/gateways/test-gateway`);
  } catch (err) {
    throw err;
  }
};

export const updateDeviceStatusAPI = async (
  starter_id: number,
  status: any
) => {
  try {
    return await $fetch.patch(`/starters/${starter_id}/deploy-status`, status);
  } catch (err) {
    throw err;
  }
}

export const updateGatewayTitleAPI = async ({
  title,
}: {
  title: string;

}) => {
  try {
    return await $fetch.put(`/gateways/test-gateway`, {
      gateway_title:
        title,
    });
  } catch (err) {
    throw err;
  }
};
export const getSingleMotorAPI = async (motor_id: any) => {
  try {
    return await $fetch.get(
      `/motors/${motor_id}`,
    );
  } catch (err) {
    throw err;
  }
};

export const getStatusGraphAPI = async ({
  device_id,
  motor_ref_id,
}: {
  device_id: any;
  motor_ref_id: any;
}): Promise<any> => {
  try {
    return await $fetch.get(
      `/test-starters/${device_id}/motors/${motor_ref_id}/connected`
    );
  } catch (err) {
    throw err;
  }
};
export const getVoltageAndCurrentGraphAPI = async ({
  starter_id,
  queryParams,
}: {

  starter_id: any;
  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/starters/${starter_id}/analytics`,
      queryParams
    );
  } catch (err) {
    throw err;
  }
};

export const getMultipleMotorsGraphAPI = async ({ payload, queryParams }: {
  payload: any;
  queryParams?: any
}) => {
  try {
    return await $fetch.post(`/motors/parameters?from_date=${queryParams.from_date}&to_date=${queryParams.to_date}`, payload);
  } catch (err) {
    throw err;
  }
};

export const getRawDataGraphAPI = async ({
  starter_id,
  queryParams,
}: {
  starter_id: any;
  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/starters/${starter_id}/analytics`,
      queryParams
    );
  } catch (err) {
    throw err;
  }
};
export const getRunTimeGraphAPI = async ({
  starter_id,
  queryParams,
}: {
  starter_id: any,

  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/starters/${starter_id}/run-time`,
      queryParams
    );
  } catch (err) {
    throw err;
  }
};
export const getRunTimeGraphCountAPI = async ({
  motor_id,
  queryParams
}: {
  motor_id: any;
  queryParams: any

}) => {
  try {
    return await $fetch.get(`/motors/${motor_id}/total-run-time`, queryParams);
  } catch (err) {
    throw err;
  }
};

export const addDeviceAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/starters", payload);
    return response;
  } catch (err) {
    throw err;
  }
};



export const getInfoDeviceAPI = async (userId: any, id: any) => {
  try {
    const response = await $fetch.get(`/starter/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateDeviceUsersAPI = async (id: any, payload: any) => {
  try {
    return await $fetch.patch(`/starter/${id}`, payload);
  } catch (err) {
    throw err;
  }
};

export const updateDeviceDetailsAPI = async (id: any, payload: any) => {
  try {
    return await $fetch.patch(`/starters/${id}/details`, payload);
  } catch (err) {
    throw err;
  }
};

export const assignUserForDeviceAPI = async (payload: any) => {
  try {
    return await $fetch.patch(`/starters/assign-web`, payload);
  } catch (err) {
    throw err;
  }
}


export const getAllUsersForDeviceAPI = async (queryParams: any) => {
  try {
    return await $fetch.get(`/users/basic`, queryParams);
  } catch (err) {
    throw err;
  }
};
export const AssignDeviceToUserAPI = async (queryParams: any) => {
  try {
    return await $fetch.get(`/starter/deployed`, queryParams);
  } catch (err) {
    throw err;
  }
}
export const UpdateAssignDeviceToUserAPI = async (payload: any) => {
  try {
    return await $fetch.patch(`/starter/assign-user`, payload);
  } catch (err) {
    throw err;
  }
}
export const getAllDeviceLogsAPI = async (
  starter_id: any,
  queryParams: any
) => {
  try {
    return await $fetch.get(`/starter/${starter_id}/audit-logs`, queryParams);
  } catch (err) {
    throw err;
  }
};
export const getAllDeviceStatusLogsAPI = async (
  starter_id: any,
  queryParams: any
) => {
  try {
    return await $fetch.get(`/starter/${starter_id}/status-logs`, queryParams);
  } catch (err) {
    throw err;
  }
};


export const removeDeviceFromMotorAPI = async (
  motorId: number
) => {
  try {
    return await $fetch.put(`/motors/${motorId}/detach-starter`);
  } catch (err) {
    throw err;
  }
}