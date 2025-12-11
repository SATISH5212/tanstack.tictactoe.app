export const generateRandomColor = (pondId: number): string => {
    let hash = pondId;
    hash = (hash ^ 61) ^ (hash >>> 16);
    hash = hash + (hash << 3);
    hash = hash ^ (hash >>> 4);
    hash = hash * 0x27d4eb2d;
    hash = hash ^ (hash >>> 15);

    const normalized = Math.abs(hash) % 1000;
    const hue = 180 + (normalized % 80);
    const saturation = 45 + (normalized % 40);
    const lightness = 35 + (normalized % 25);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};



const COLORS = [
    "#FF3131", 
    "#FDDA0D",
    "#0096FF", 
    "#16A34A", 
    "#A855F7", 
    "#F97316", 
    "#E11D48", 
    "#0EA5E9", 
    "#FACC15",
    "#14B8A6", // teal
];

export const getColorFromMotorIdInGraph = (motorId: string | number) => {
    const idStr = motorId.toString();
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
};
