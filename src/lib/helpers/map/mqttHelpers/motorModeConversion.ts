export function getModeString(modeNumber: number): string {
    const stringMap: Record<number, string> = {
        0: "LOCAL + MANUAL",
        1: "LOCAL + AUTO",
        2: "REMOTE + MANUAL",
        3: "REMOTE + AUTO",
    };
    return stringMap[modeNumber] || "LOCAL + MANUAL";
}

export function getModeNumber(modeString: string): number {
    const modeMap: Record<string, number> = {
        "LOCAL+MANUAL": 0,
        "LOCAL+AUTO": 1,
        "REMOTE+MANUAL": 2,
        "REMOTE+AUTO": 3
    };

    const normalized = modeString.replace(/\s/g, "");
    return modeMap[normalized] ?? 1;
}