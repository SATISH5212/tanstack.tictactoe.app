const SIGNAL_COLORS = {
  marginal: "bg-red-500",
  ok: "bg-orange-500",
  good: "bg-blue-500",
  excellent: "bg-green-500",
  invalid: "bg-gray-400",
};

export const getBarsFromCode = (code?: number | null): number => {
  if (typeof code !== "number") return 0;
  if (code >= 20 && code <= 30) return 4;
  if (code >= 15 && code <= 19) return 3;
  if (code >= 10 && code <= 14) return 2;
  if (code >= 2 && code <= 9) return 1;

  return 0;
};


export const getSignalMeta = (code?: number | null) => {
  if (typeof code !== "number") {
    return { label: "Invalid signal", color: SIGNAL_COLORS.invalid };
  }

  if (code >= 2 && code <= 9) {
    return { label: "Marginal strength", color: SIGNAL_COLORS.marginal };
  }

  if (code >= 10 && code <= 14) {
    return { label: "OK strength", color: SIGNAL_COLORS.ok };
  }

  if (code >= 15 && code <= 19) {
    return { label: "Good strength", color: SIGNAL_COLORS.good };
  }

  if (code >= 20 && code <= 30) {
    return { label: "Excellent strength", color: SIGNAL_COLORS.excellent };
  }

  return { label: "Invalid signal", color: SIGNAL_COLORS.invalid };
};

