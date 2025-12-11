export type Coordinates = {
  lat: number;
  lng: number;
} | null;


export interface PolygonOptions {
  fillColor: string;
  strokeColor: string;
  strokeWeight: number;
  clickable: boolean;
  editable: boolean;
  draggable: boolean;
}
