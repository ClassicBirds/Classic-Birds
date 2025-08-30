// pages/_app.tsx
import "@/styles/globals.css";
import "@/styles/roadmap.css";
import "tailwindcss/tailwind.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import Layout from "../Layout/layout";
import store from "../store/store";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "../error/error";
import { useRouter } from "next/router";
import { Web3ModalProvider } from "../context/Web3Modal";
import { WagmiConfig } from "wagmi";
import { config } from "@/config/wagmi"; // Make sure this file exists

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);
  const { pathname } = useRouter();
  
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <ErrorBoundary>
          <WagmiConfig config={config}>
            <Web3ModalProvider>
              <ThemeProvider attribute="class">
                <ToastContainer 
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <Provider store={store}>
                  <Layout pathname={pathname}>
                    <Component {...pageProps} />
                  </Layout>
                </Provider>
              </ThemeProvider>
            </Web3ModalProvider>
          </WagmiConfig>
        </ErrorBoundary>
      ) : null}
    </>
  );
}
