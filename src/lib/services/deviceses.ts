import { $fetch } from "../fetch";
export const getAllPaginatedDeviceData = async ({
  pageIndex,
  pageSize,
  search_string,
  device_status,
  sort_by,
  sort_type,
  power,
  status
}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      limit: pageSize,
      search_string,
      device_status,
      sort_by,
      sort_type,
      power,
      status
    };
    return await $fetch.get("/starter/all", queryParams);
  } catch (err) {
    throw err;
  }
};
export const getSingleDeviceAPI = async (id: string | undefined) => {
  const queryParams = {
    //   metadata: true,
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
  starter_id: any,
  status: any
) => {
  try {
    return await $fetch.put(`/starter/${starter_id}/device-status`, status);
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
export const getVoltageGraphAPI = async ({

  starter_id,
  motor_id,
  queryParams,
}: {

  starter_id: any;
  motor_id: any;
  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/starter/${starter_id}/motors/${motor_id}/power-voltage-consumption`,
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

export const getEmptyMotorGraphAPI = async ({
  starter_id,
  motor_id,
  queryParams,
}: {
  starter_id: any;
  motor_id: any;
  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/starter/${starter_id}/motors/${motor_id}/power-voltage-consumption-motor-ref`,
      queryParams
    );
  } catch (err) {
    throw err;
  }
};
export const getRunTimeGraphAPI = async ({

  motor_id,
  queryParams,
}: {

  motor_id: any;
  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/motors/${motor_id}/run-time`,
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

export const getCurrentTestGraphAPI = async ({

  device_id,
  motor_ref_id,
  queryParams,
}: {
  device_id: any;
  motor_ref_id: any;
  queryParams: any;
}) => {
  try {
    return await $fetch.get(
      `/test-starters/${device_id}/motors/${motor_ref_id}/voltage-current`,
      queryParams
    );
  } catch (err) {
    throw err;
  }
};

export const addDeviceAPI = async (payload: any) => {
  try {
    const response = await $fetch.post("/starter", payload);
    return response;
  } catch (err) {
    throw err;
  }
};
export const getAllGateWays = async (userId: any) => {
  try {
    const response = await $fetch.get(`/users/${userId}/gateways`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getSinglePondDeviceAPI = async (userId: any, id: any) => {
  try {
    const response = await $fetch.get(`/starter/${id}`);
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
export const assignUserForDeviceAPI = async (payload: any) => {
  try {
    return await $fetch.patch(`/starter/assign-device-to-user`, payload);
  } catch (err) {
    throw err;
  }
}



export const getPondBasedMotorsSettingsAPI = async () => {
  try {
    return await $fetch.get(`/starter-settings/default`);
  } catch (err) {
    throw err;
  }
}
export const updatePondBasedMotorsSettingsAPI = async (

  payload: any
) => {
  try {
    return await $fetch.patch(`/starter-settings/default/1`, payload);
  } catch (err) {
    throw err;
  }
};
export const getAllUsersForDeviceAPI = async (queryParams: any) => {
  try {
    return await $fetch.get(`/users/drop-down`, queryParams);
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