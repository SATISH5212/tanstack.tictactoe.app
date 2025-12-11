const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_MAP_API_KEY as string;
export async function getAddressFromCoordinates(
  [lng, lat]: [number, number]
): Promise<string | undefined> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Mapbox request failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.features?.[0]?.place_name;
  } catch (e) {
    console.error("Failed to fetch address:", e);
    return undefined;
  }
}
