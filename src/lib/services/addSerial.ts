export const addSerial = (dataArray: any, page: any, limit: any) => {
  if (dataArray?.length) {
    let arrayAfterSerial = dataArray.map((item: any, index: number) => {
      return { ...item, serial: (page - 1) * limit + (index + 1) };
    });
    return arrayAfterSerial;
  }
  return [];
};
