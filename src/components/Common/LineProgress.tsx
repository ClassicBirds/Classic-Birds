import React from "react";
import { calculatePercentage } from "@/utils/numbers";
type Props = {
  filled: number;
  totalSold: any;
};


function LineProgress({ totalSold }: Props) {
  const _amount = calculatePercentage("1000", totalSold.toString());
  const _totalsold = totalSold.toLocaleString();

  const filled = Number(_amount);

  const filledBarStyle = {
    height: "100%",
    width: `${filled > 100 ? 100 : filled}%`,
  };

  return (
    <div className="py-5 mr-4 space-y-2 overflow-hidden w-full ">
      <div className=" h-[30px] overflow-hidden w-full bg-stone-700 rounded-xl flex-1 bg-LineProgress-gradient">
        <div
          className="rounded-xl !overflow-hidden h-full  bg-LineProgress-done"
          style={filledBarStyle}
        ></div>
      </div>
    </div>
  );
}

export default LineProgress;
