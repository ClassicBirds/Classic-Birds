import { useAppSelector, useAppdispatch } from "../hooks/redux";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header/Header";

import GoToTop from "@/components/Gtop/GoToTop";
import { useAccount } from "wagmi";
import Fotter from "@/components/Fotter/Fotter";

import AOS from "aos";
import "aos/dist/aos.css";

const Layout = (props: any) => {
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-in-sine",
      // delay: 100,
    });
  }, []);

  return (
    <div className=" bg-[#0b0909d9]">
      <Header />
      {props.children}
      {/* <GoToTop /> */}
     <Fotter />
    </div>
  );
};

export default Layout;
