import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import WarningIcon from "../icons/Warning";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useQuery } from "@tanstack/react-query";
import { getDeviceInfo } from "@/lib/services/users";
import { useParams } from "@tanstack/react-router";

dayjs.extend(utc);

type InfoDialogBoxProps = {
  openOrNot: boolean;
  onCancelClick: () => void;
  deviceDetails: {
    title: string;
    mac_address: string;
    pcb_number: string;
    gateway_name: string;
    pond_name: string;
    test_date: string;
    deployed_date: string;
    id: any;
  };
};

const InfoDialogBox = ({
  openOrNot,
  onCancelClick,
  deviceDetails,
}: InfoDialogBoxProps) => {
  const { device_id } = useParams({ strict: false });
  const { data: deviceInfo, isLoading: isLoadingDeviceInfo } = useQuery({
    queryKey: ["deviceInfo", deviceDetails.id],
    queryFn: async () => {
      const response = await getDeviceInfo(deviceDetails.id);
      return response.data?.data;
    },
    refetchOnWindowFocus: false,
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <AlertDialog open={openOrNot}>
      <AlertDialogContent className="bg-white max-w-md rounded-lg shadow-lg border border-gray-200 p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-black text-lg 3xl:text-xl font-medium flex items-center gap-2 border-b border-green-500 pb-2">
            <WarningIcon className="text-red-600 size-6" /> Device Info
          </AlertDialogTitle>
        </AlertDialogHeader>

        {isLoadingDeviceInfo ? (
          <div className="mt-6 h-[350px] flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
          </div>
        ) : (
          <div className=" space-y-4 text-sm text-gray-700">
            <div className="flex justify-between items-center p-1 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">Device Name :</strong>
              <span className="text-gray-600">
                {deviceInfo?.title ? deviceInfo?.title : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">MAC Address :</strong>
              <span className="text-gray-600">
                {deviceInfo?.mac_address ? deviceInfo?.mac_address : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">PCB Number :</strong>
              <span className="text-gray-600">
                {deviceInfo?.pcb_number ? deviceInfo?.pcb_number : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">Gateway :</strong>
              <span className="text-gray-600">
                {deviceInfo?.gateways?.title
                  ? deviceInfo?.gateways?.title
                  : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">Ponds :</strong>
              <span className="text-gray-600 capitalize">
                {deviceInfo?.ponds?.length > 0
                  ? deviceInfo.ponds.map((pond: any) => pond.title).join(", ")
                  : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">
                Deployed Date :
              </strong>
              <span className="text-gray-600">
                {deviceInfo?.deployed_date
                  ? dayjs(deviceInfo?.deployed_date)
                      .utc()
                      .add(5, "hour")
                      .add(30, "minute")
                      .format("DD-MM-YYYY hh:mm A")
                  : "--"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md border-l-4 border-green-500">
              <strong className="text-black font-medium">Test Date :</strong>
              <span className="text-gray-600">
                {deviceInfo?.test_date
                  ? dayjs(deviceInfo?.test_date)
                      .utc()
                      .add(5, "hour")
                      .add(30, "minute")
                      .format("DD-MM-YYYY hh:mm A")
                  : "--"}
              </span>
            </div>
          </div>
        )}
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel
            className="font-medium h-9 px-5 bg-red-500 text-white rounded-md hover:bg-red-700  hover:text-white transition-colors duration-200 "
            onClick={onCancelClick}
          >
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InfoDialogBox;
