export const truncate = (text: string | undefined, maxLength: number = 12) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
