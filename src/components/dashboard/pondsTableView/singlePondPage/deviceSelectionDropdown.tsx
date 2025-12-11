import DeviceNodeIcon from "@/components/icons/device/DeviceNodeIcon";
import {
  DeviceSelectionDropdownProps,
  UserDevices,
} from "@/lib/interfaces/maps/ponds";
import { Loader2 } from "lucide-react";
import { FC } from "react";

const DeviceSelectionDropdown: FC<DeviceSelectionDropdownProps> = ({
  motor,
  refProp,
  isReplaceMode,
  searchString,
  setSearchString,
  filteredDevices,
  starterId,
  setStarterId,
  selectedNodeIndex,
  setSelectedNodeIndex,
  handleNodeClick,
  handleCancelClick,
  handleConnectClick,
  isPending,
}) => {
  return (
    <div
      ref={refProp}
      className="absolute top-full mt-2 right-0 z-50 w-80 border rounded-xl shadow-lg p-3 bg-white"
    >
      <h3 className="text-sm font-normal text-black mb-1">
        {isReplaceMode
          ? "Select Replacement Device Node"
          : "Select Device Node"}
      </h3>

      <input
        type="text"
        placeholder="Search devices..."
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        className="p-1 w-full text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 mb-2"
      />

      <div className="space-y-1 max-h-56 overflow-y-auto mb-1">
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device: UserDevices) => {
            const isDeviceSelected = starterId === String(device.id);
            return (
              <div
                key={device.id}
                className={`border rounded-lg py-2 px-4 transition-colors ${isDeviceSelected
                  ? "border-green-500 bg-green-50"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
              >
                <h4 className="text-sm font-normal text-blue-700 truncate capitalize mb-1 ">
                  {device.alias_starter_title || device.title}
                </h4>

                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: device.capable_motors || 1 }).map(
                    (_, index) => {
                      const isSelected =
                        selectedNodeIndex == index + 1 &&
                        starterId == String(device.id);

                      const nodeRef = index === 0 ? "mtr_1" : "mtr_2";
                      const isConnected =
                        device.connected_nodes?.includes(nodeRef);

                      return (
                        <button
                          key={index}
                          title={isConnected ? "Node already connected" : ""}
                          className={`flex items-center gap-2 py-1 px-2  text-xs font-normal border rounded-lg transition-all 
                          ${isSelected
                              ? "bg-green-600 text-white border-green-700 shadow-sm "
                              : isConnected
                                ? "bg-red-500 text-white border-red-600 opacity-70 cursor-not-allowed"
                                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                            }
                          disabled:cursor-not-allowed 
                        `}
                          disabled={isConnected}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isConnected) return;

                            if (isSelected) {
                              setSelectedNodeIndex(null);
                              setStarterId("");
                            } else {
                              handleNodeClick(index, device);
                            }
                          }}
                        >
                          <DeviceNodeIcon
                            className={`w-3 h-3 ${isSelected || isConnected
                              ? "text-white"
                              : "text-gray-600"
                              }`}
                          />
                          Node {index + 1}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-gray-500 text-center py-6">
            {searchString.trim() ? "No devices found" : "No devices available"}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={handleCancelClick}
          className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 transition border-gray-200"
          disabled={isPending}
        >
          Cancel
        </button>

        <button
          onClick={() => handleConnectClick(motor)}
          disabled={isPending || selectedNodeIndex === null}
          className={`px-4 py-1 text-sm rounded-md font-normal transition-colors 
            ${selectedNodeIndex === null
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
            }
          `}
        >
          {isPending ? (
            <Loader2 className="animate-spin w-4 h-4 mx-auto" />
          ) : isReplaceMode ? (
            "Replace"
          ) : (
            "Connect"
          )}
        </button>
      </div>
    </div>
  );
};

export default DeviceSelectionDropdown;
