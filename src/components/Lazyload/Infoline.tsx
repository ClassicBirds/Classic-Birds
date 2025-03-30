import React from "react";

type Props = {};

function Infoline({}: Props) {
  return (
    <div
      role="status"
      className="space-y-8 bg-[#9d9d9d] mt-2 animate-pulse md:space-y-0 md:space-x-8 md:flex items-center w-[100px] h-[10px] rounded-lg"
    >
      <div className="w-full">
        <div className="h-[10px]  py-2  rounded-lg bg-gray-700 max-w-[60px] "></div>
      </div>
    </div>
  );
}

export default Infoline;
