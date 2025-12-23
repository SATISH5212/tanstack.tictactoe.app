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


export const formatUtcToLocal = (utcString?: string, options?: Intl.DateTimeFormatOptions) => {
    if (!utcString) return "";

    const date = new Date(utcString);

    if (isNaN(date.getTime())) {
        console.warn("Invalid UTC date:", utcString);
        return "";
    }

    return date.toLocaleString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        ...options,
    });
};

export default formatUtcToLocal;
