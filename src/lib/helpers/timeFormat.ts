export const formatUstToIST = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatUtcToLocal = (utc: number | string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(utc);

    if (isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        ...options,
    });
};


