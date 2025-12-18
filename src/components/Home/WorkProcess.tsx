import React from "react";
import { motion } from "framer-motion";

const connectorSvgs = [
  <svg
    key="connector-1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 356 126.116"
    overflow="visible"
  >
    <g>
      <defs>
        <linearGradient
          id="connector1Gradient"
          x1="0.49751243781094523"
          x2="0.5024875621890548"
          y1="0"
          y2="1"
        >
          <stop offset="0" stopColor="#145A4B" stopOpacity="1"></stop>
          <stop
            offset="0.4318869650900901"
            stopColor="#838383"
            stopOpacity="1"
          ></stop>
          <stop offset="1" stopColor="#020D0E" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <path
        d="M 356 126.116 L 351.939 126.116 L 351.939 120.88 C 351.939 103.083 337.96 87.962 319.068 85.33 L 36.332 45.929 C 15.451 43.018 0 26.31 0 6.639 L 0 0 L 4.061 0 L 4.061 6.64 C 4.061 24.437 18.04 39.554 36.932 42.187 L 319.668 81.588 C 340.549 84.497 356 101.21 356 120.88 Z"
        fill="url(#connector1Gradient)"
      ></path>
    </g>
  </svg>,

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 356 126.116" overflow="visible">
  <g>
    <defs>
      <linearGradient id="idsZnZDypoyVwBGXXecTi_1g-631341532" x1="0.49751243781094523" x2="0.5024875621890548" y1="0" y2="1">
        <stop offset="0" stop-color="#1B5C4A" stop-opacity="1"></stop>
        <stop offset="0.45326576576576577" stop-color="#838383" stop-opacity="1"></stop>
        <stop offset="1" stop-color="#051F1A" stop-opacity="1"></stop>
      </linearGradient>
    </defs>
    <path d="M 356 6.64 C 356 26.31 340.549 43.019 319.668 45.929 L 36.933 85.33 C 18.04 87.962 4.061 103.081 4.061 120.877 L 4.061 126.116 L 0 126.116 L 0 120.877 C 0 101.207 15.451 84.497 36.331 81.588 L 319.068 42.187 C 337.96 39.554 351.939 24.437 351.939 6.64 L 351.939 0 L 356 0 Z" fill="url(#idsZnZDypoyVwBGXXecTi_1g-631341532)"></path>
  </g>
</svg>
];

const WorkProcess = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="rounded-2xl p-8 overflow-x-hidden mb-20"
    >
      <div className="mb-10 mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold  mb-4 leading-tight text-foreground">
          How <span className="gradient-text3">ChainRefer </span>works
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-20 tracking-tight">
          ChainRefer connects incredible people to opportunities. It's for
          people hiring, connecting others, or even job-seeking themselves.
        </p>
      </div>
      <div className="flex flex-col gap-8">
        {/* Process 1 */}
        <div className="process1 h-[28rem] grid grid-cols-2 gap-6">
          <div className="col-span-1 h-full w-[32rem] aspect-[4/5] rounded-lg relative overflow-hidden flex justify-end items-center ml-12">
            <img
              src={"/W1.png"}
              alt={"Student Build Profile and Upload Resume"}
              className="absolute w-full h-full rounded-lg object-fill object-center z-0"
            />
          </div>
          <div className="col-span-1 w-[60%] flex flex-col justify-end items-start">
            <div className="h-12 w-14 flex items-center justify-center py-2 border-2 border-border rounded-lg text-3xl mb-4">
              01
            </div>

            <h3 className="text-3xl font-semibold text-foreground mb-2">
              Student Build Profile and Upload Resume
            </h3>
            <p className="text-md text-muted-foreground">
              Resume PDF uploaded, hash stored on Aptos blockchain
            </p>
          </div>
        </div>

        {/* Process Connectors */}
        <div className="svgConnector1 w-full flex justify-center items-center -my-8">
          <div className="w-[60%] max-w-[500px]">
            {connectorSvgs[0]}
          </div>
        </div>

         {/* Process 2 */}
        <div className="process2 h-[28rem] grid grid-cols-2 gap-6">
          <div className="col-span-1 w-[60%] flex flex-col justify-end items-end text-right ml-48">
            <div className="h-12 w-14 flex items-center justify-center py-2 border-2 border-border rounded-lg text-3xl mb-4">
              02
            </div>

            <h3 className="text-3xl font-semibold text-foreground mb-2">
              Verifier Approves and Verifies Credentials
            </h3>
            <p className="text-md text-muted-foreground">
              College authority verifies authenticity on-chain
            </p>
          </div>
          <div className="col-span-1 h-full w-[32rem] aspect-[4/5] rounded-lg relative overflow-hidden flex justify-end items-center">
            <img
              src={"/W2.png"}
              alt={"Student Build Profile and Upload Resume"}
              className="absolute w-full h-full rounded-lg object-fill object-center z-0"
            />
          </div>
        </div>

        {/* Process Connectors */}
        <div className="svgConnector1 w-full flex justify-center items-center -my-8">
          <div className="w-[60%] max-w-[500px]">
            {connectorSvgs[1]}
          </div>
        </div>

         {/* Process 3 */}
        <div className="process3 h-[28rem] grid grid-cols-2 gap-6">
          <div className="col-span-1 h-full w-[32rem] aspect-[4/5] rounded-lg relative overflow-hidden flex justify-end items-center ml-12">
            <img
              src={"/W3.png"}
              alt={"Alumni Refers Based on Verified Credentials"}
              className="absolute w-full h-full rounded-lg object-fill object-center z-0"
            />
          </div>
          <div className="col-span-1 w-[60%] flex flex-col justify-end items-start">
            <div className="h-12 w-14 flex items-center justify-center py-2 border-2 border-border rounded-lg text-3xl mb-4">
              03
            </div>

            <h3 className="text-3xl font-semibold text-foreground mb-2">
              Alumni Refers Based on Verified Credentials
            </h3>
            <p className="text-md text-muted-foreground">
              Trusted referrals based on verified credentials
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkProcess;

/* {index < 2 && (
              <div className="hidden sm:block absolute top-8 right-0 w-8 h-0.5 bg-border" />
            )} */
