const formatUstToIST = (dateString: string) => {
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

export default formatUstToIST;