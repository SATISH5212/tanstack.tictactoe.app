import React from "react";
export const MeterIcon = (
props: React.SVGProps<SVGSVGElement>) => {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="gray"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
        >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.5236 7.22237L14.5379 9.20805C15.5497 10.2937 16.1352 11.7072 16.1901 13.1908H19C18.945 10.9626 18.0621 8.83477 16.5236 7.22237ZM10.2312 4.42004V7.22993C11.7128 7.28488 13.1263 7.87227 14.212 8.88213L16.1977 6.89645C14.5853 5.35985 12.4575 4.47687 10.2312 4.42004ZM3.80232 6.89645L5.788 8.88213C6.87368 7.87227 8.28715 7.28488 9.76885 7.22993V4.42004C7.54253 4.47687 5.41475 5.35985 3.80232 6.89645ZM3.47643 7.22237C1.93789 8.83477 1.05495 10.9626 1 13.1908H3.80991C3.86484 11.7072 4.45031 10.2937 5.46211 9.20805L3.47643 7.22237Z"
          fill="#333333"
        />
      </svg>
    </div>
  );
};







