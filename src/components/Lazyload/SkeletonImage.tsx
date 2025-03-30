import React from "react";

type Props = {
  height?: number;
  width?: number;
};

function SkeletonImage({ height, width }: Props) {
  const boxHeight = height || 300;
  return (
    <div role="status" className="space-y-8 mx-auto rounded-3xl w-full h-full	 flex justify-center animate-pulse  ">
      <div
    
        className={`flex items-center justify-center rounded-3xl  w-full h-full		 bg-cyan-400 bg-opacity-10  dark:bg-gray-700`}
      >
        <svg
          className="w-10 h-10 flex items-center text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 18"
        >
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
        </svg>
      </div>
    </div>
  );
}

export default SkeletonImage;
