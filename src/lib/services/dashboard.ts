import { $fetch } from "../fetch";
export const getDashboardStatsAPI = async () => {
  try {
    return await $fetch.get(`/dashboard/stats-count`);
  } catch (err) {
    throw err;
  }
};