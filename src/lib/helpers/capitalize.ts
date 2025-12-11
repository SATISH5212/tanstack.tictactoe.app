export const capitalize = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());


export const formatText = (str: string) => {
  if (!str) return "";

  const words = str.trim().split(/\s+/);
  const first = words[0].toUpperCase();

  const rest = words
    .slice(1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");

  return first + " " + rest;
};

export const captalizeLocation = (location: string) => {
  return location.charAt(0) + location.slice(1).toLowerCase()

}


export function capitalizeFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

