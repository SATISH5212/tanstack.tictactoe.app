import HighCharts from "@/components/HighCharts";
import { NoDeviceMotorData } from "@/components/svg/NoDeviceMotorData";
import { IMotorActivitySheetProps } from "@/lib/interfaces/ponds";
import { FC } from "react";


const MotorActivitySheet: FC<IMotorActivitySheetProps> = (props) => {
  const {
    selectedPondIndex,
    mapPonds,
    dateValue,
    setDateValue,
    dateRange,
    setDateRange,
    singleMotorData,
    isMotorLoading,
    selectedMotorIds,
  } = props;

  const selectedPond = selectedPondIndex !== null && mapPonds[selectedPondIndex]
    ? mapPonds[selectedPondIndex]
    : null;

  // useEffect(() => {
  //   if (selectedPond?.motors?.length && selectedMotorIds.length === 0) {
  //     const initialMotor = selectedPond.motors[0];
  //     setSelectedMotorIds([initialMotor?.id]);
  //   }
  // }, [selectedPond]);



  const selectedMotorsPayload = selectedPond?.motors
    .filter((m: any) => selectedMotorIds.includes(m.id) && m.starter_id)
    .map((m: any) => ({
      motor_id: m.id,
      starter_id: m.starter_id,
    })) || [];

  const isMultipleMotorsSelected = selectedMotorIds.length > 1;

  return (
    <div className="w-full h-full">
      <div className="w-full  overflow-x-hidden ">
        {isMotorLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-230px)] text-gray-500 text-sm">
            Loading motor data…
          </div>
        ) : (
          <div className="space-y-1 ">
            {selectedMotorIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 rounded-xl h-[calc(100vh-160px)] bg-gray-50 border border-gray-200 shadow-sm">
                <NoDeviceMotorData />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Motors Selected
                </h3>
                <p className="text-sm text-gray-500">
                  Select a motor above to view its activity.
                </p>
              </div>
            ) : isMultipleMotorsSelected ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-2">
                  <HighCharts
                    starterId={selectedPond && selectedPond.motors && selectedPond.motors[0]?.starter_id}
                    motorData={singleMotorData}
                    dateValue={dateValue}
                    setDateValue={setDateValue}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    paramater="voltage"
                    noMotors={false}
                    selectedMotorsPayload={selectedMotorsPayload}
                    isMultipleMotorsSelected={isMultipleMotorsSelected}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-2">
                  <HighCharts
                    starterId={selectedPond && selectedPond.motors && selectedPond.motors[0]?.starter_id}
                    motorData={singleMotorData}
                    dateValue={dateValue}
                    setDateValue={setDateValue}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    paramater="current"
                    noMotors={false}
                    selectedMotorsPayload={selectedMotorsPayload}
                    isMultipleMotorsSelected={isMultipleMotorsSelected}
                  />
                </div>
              </div>
            ) : (
              selectedMotorIds.map((motorId: number) => {
                const motorObj = selectedPond?.motors.find(
                  (m: any) => m.id === motorId
                );
                return (
                  <div key={motorId} className="space-y-4">

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-2">
                      <HighCharts
                        starterId={motorObj?.starter_id}
                        motorData={motorObj}
                        dateValue={dateValue}
                        setDateValue={setDateValue}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        paramater="voltage"
                        motorId={motorId}
                        motor_ref_id={motorObj?.motor_ref_id}
                        noMotors={false}
                        selectedMotorsPayload={null}
                      />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-2">
                      <HighCharts
                        starterId={motorObj?.starter_id}
                        motorData={motorObj}
                        dateValue={dateValue}
                        setDateValue={setDateValue}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        paramater="current"
                        motorId={motorId}
                        motor_ref_id={motorObj?.motor_ref_id}
                        noMotors={false}
                        selectedMotorsPayload={null}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MotorActivitySheet;
