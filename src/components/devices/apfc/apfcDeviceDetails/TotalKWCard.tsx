import React from "react";
import { Card } from "src/components/ui/card";
import FrequencyIcon from "src/components/icons/apfc/Frequency";

const TotalKWCard = ({
  cardimage,
  mainDetails,
  subDetails,
}: {
  cardimage?: any;
  mainDetails?: any;
  subDetails?: any;
}) => {
  return (
    <Card className="rounded-lg ">
      <div className=" grid grid-cols-2 items-center p-4 rounded-lg shadow-none border-none h-full bg-white">
        <div className="left-column flex flex-col items-start text-left  mr-4 border-r border-gray-300">
          {cardimage ? cardimage : ""}
          <div className=" text-xs 3xl:text-sm font-normal mb-2 text-black/70 ">
            {mainDetails[0] ? mainDetails[0] : "--"}
          </div>
          <div className=" text-xl 3xl:text-2xl font-normal text-05A155  leading-none">
            {mainDetails[1] ? mainDetails[1] : "--"}
          </div>
        </div>

        <div className="right-column flex flex-col items-start justify-between">
          {Array.isArray(subDetails) ? (
            <div className="flex flex-col items-start">
              <FrequencyIcon className="size-5 mb-2" />
              <div className="  text-xs 3xl:text-sm font-normal mb-2 text-black/70 ">
                {subDetails?.[0] || "--"}
              </div>
              <div className="text-xl 3xl:text-2xl font-normal text-05A155  leading-none">
                {subDetails?.[1] || "--"}
              </div>
            </div>
          ) : (
            Object.keys(subDetails)?.map((item, index) => (
              <div className="row flex justify-between w-full py-1" key={index}>
                <div className="text-xxs  3xl:text-xs font-normal  text-black/70">
                  {item}
                </div>
                <div className=" text-smd 3xl:text-base font-normal text-35353d leading-none">
                  {subDetails[item] || "--"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default TotalKWCard;
