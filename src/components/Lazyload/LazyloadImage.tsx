import React, { useEffect, useState } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';

import SkeletonImage from "./SkeletonImage";
type Props = {
  src: string; // Assuming src is a string URL
  height?:number,
  isRound?:boolean
};

function LazyloadImage({ src ,height,isRound}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);

  function handleImageLoad() {
    setImageLoaded(true);
  }

  return (
    <div className="w-full aspect-square	">
      <LazyLoadImage
        src={src}
        loading='lazy'
        alt="Image"
        style={{
          backgroundColor: "#ffffff ",
          width:imageLoaded?"":"0px",
          height:imageLoaded?"":"0px",
          // border: "2px solid #DAA200",
          borderBottom: "none",
          borderLeft: "50%",
          borderRight: "50%",
          opacity:imageLoaded?"":"0",
          
        }}
     
        // loading="lazy"
  
        // blurDataURL={placeholder.src}
        className={`w-full h-full rounded-3xl ${
          imageLoaded ? "w-full " : "h-[0px] w-[0px]"
        }`}
        onError={(e: any) => {
          e.target.style.display = "none"; // Hide the broken image icon
        }}
       onLoad={handleImageLoad}
      />
      {!imageLoaded && <SkeletonImage height={height} />}
    </div>
  );
}

export default LazyloadImage;
