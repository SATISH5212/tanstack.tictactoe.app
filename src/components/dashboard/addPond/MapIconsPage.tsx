import EditPondIcon from "@/components/svg/map/EditPondIcon";
import LineStringIcon from "@/components/svg/map/LineStringIcon";
import { FC } from "react";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import DeleteIcon from "@/components/svg/DeleteIcon";
import PolygonIcon from "@/components/svg/map/PolygonIcon";
import RedoIcon from "@/components/svg/map/RedoIcon";
import UndoIcon from "@/components/svg/map/UndoIcon";
import { IMapIconsPageProps } from "@/lib/interfaces/maps/ponds";

const MapIconsPage: FC<IMapIconsPageProps> = (props) => {
  const {
    showResults,
    pond,
    drawMode,
    handleLineStringMode,
    handlePolygonMode,
    handleUndo,
    handleRedo,
    handleDeletePond,
    handleEdit,
    canUndo,
    canRedo,
    isPondEditing,
  } = props;
  const hasBoundary = pond?.coordinates && pond.coordinates.length > 0;
  const needsBoundary = isPondEditing && !hasBoundary;

  return (
    <div className="absolute top-3 left-[420px] z-10 flex flex-col space-y-2">
      <div className="flex flex-col rounded shadow space-y-2">
        {!showResults && (!pond || needsBoundary) && (


          <button
            onClick={handleLineStringMode}
            disabled={hasBoundary && !needsBoundary}
            className={`p-2 w-[35px] rounded transition-colors ${drawMode === "draw_line_string"
              ? "bg-blue-500 text-white"
              : (hasBoundary && !needsBoundary)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            title={
              (hasBoundary && !needsBoundary)
                ? "Delete current pond to draw new one"
                : "Draw Line String"
            }
          >
            <LineStringIcon className="w-[20px] h-[20px]" />
          </button>
        )}
        {!showResults && (!pond) && (

          <button
            onClick={handlePolygonMode}
            disabled={hasBoundary && !needsBoundary}
            className={`p-2  w-[35px] rounded transition-colors ${drawMode === "draw_polygon"
              ? "bg-blue-500 text-white"
              : (hasBoundary && !needsBoundary)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            title={
              (hasBoundary && !needsBoundary)
                ? "Delete current pond to draw new one"
                : "Draw Polygon"
            }
          >
            <PolygonIcon className="w-[20px] h-[20px]" />
          </button>
        )}
      </div>

      {!showResults && pond && hasBoundary && (
        <div className="flex flex-col rounded shadow space-y-2">
          {!isPondEditing && (
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Edit Pond"
            >
              <EditPondIcon />
            </button>
          )}

          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-2 rounded transition-colors ${canUndo
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            title={canUndo ? "Undo" : "Nothing to undo"}
          >
            <UndoIcon />
          </button>

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-2 rounded transition-colors ${canRedo
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            title={canRedo ? "Redo" : "Nothing to redo"}
          >
            <RedoIcon />
          </button>

          <button
            onClick={handleDeletePond}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Delete Pond"
          >
            <DeleteIcon />
          </button>
        </div>
      )}
      {needsBoundary && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-xs mb-2 max-w-[200px]">
          <p className="font-semibold mb-1">Draw Boundary Required</p>
          <p>This pond needs a boundary. Use the tool above to draw pond boundary.</p>
        </div>
      )}
    </div>
  );
};

export default MapIconsPage;