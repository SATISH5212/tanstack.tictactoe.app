export const calculateFlc = (hp: number, flcEdited: number): number => (flcEdited > 0 ? hp * flcEdited : hp || 0);
export const convertPercentageToValue = (percentage: number | undefined, flc: number, defaultPercentage: number): number =>
    ((percentage || defaultPercentage) / 100) * flc;
export const formatNumber = (value: number | undefined): number | undefined => {
    if (value === undefined) return undefined;
    return parseFloat(value.toFixed(2));
};