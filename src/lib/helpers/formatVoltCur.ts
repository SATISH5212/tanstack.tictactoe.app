const formatValue = (val : number) =>
  val !== undefined && val !== null && !isNaN(val)
    ? Number(val).toFixed(1)
    : "--";

export default formatValue;