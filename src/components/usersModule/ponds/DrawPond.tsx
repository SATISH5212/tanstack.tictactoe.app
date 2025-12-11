import { Button } from "@/components/ui/button";

const DrawPond = () => {

    return (
        <div className="bg-gray-100">
        <span>Draw Your Field on  map</span>
        <span>
            Simplify use the polygon tool to outline your fields directly on the map
        </span>
        <Button className="bg-green-500">Draw Field</Button>
        </div>
    );
}