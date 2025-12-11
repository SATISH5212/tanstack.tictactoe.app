import { Coordinates } from "@/lib/types.ts";
import { useState } from "react"
import AddBoundaryMap from "./AddBoundaryMap";

const AddPond =()=>
{
    const [coordinates, setCoorinates] = useState<Coordinates[]>([]);
    const [pondAccessPoint, setPondAccessPoint] = useState<Coordinates | null>(
      null
    );
    return (
      <div className="relative w-full h-screen">
        <div className="absolute inset-0 z-0 w-full h-screen">
          <AddBoundaryMap
            // setCoorinates={setCoorinates}
            // setPondAccessPoint={setPondAccessPoint}
            
          
          />
        </div>

        {/* <AddFieldFormPage
          }
        /> */}
      </div>
    );
    
}
export default AddPond