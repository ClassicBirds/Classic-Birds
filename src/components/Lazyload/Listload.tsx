import React from "react";

type Props = {
  title: string;
  isCenter?: boolean;
};

function Listload({ title, isCenter }: Props) {
  return (
    <div
      role="status"
      className={`${
        isCenter ? "mx-auto max-w-7xl my-5" : "max-w-[700px] md:w-[500px] "
      }  w-full p-4 space-y-4 rounded-xl bg-white dark:bg-darkbg  divide-y divide-loadbg shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-darkbg`}
    >
      {/* <h1 className="text-2xl p font-bold dark:text-darktext">
         {title}
          </h1> */}

      <div className="border-none">
        <h1 className="text-2xl p font-bold dark:text-darktext">{title}</h1>
      </div>

      <div className="flex items-center justify-between border-none">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div className="w-32 h-2 bg-loadbg rounded-full dark:bg-gray-700"></div>
        </div>
        <div className="h-2.5 bg-loadbg rounded-full dark:bg-gray-700 w-12"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Listload;
