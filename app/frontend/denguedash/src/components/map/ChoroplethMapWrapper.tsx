"use client";

import dynamic from "next/dynamic";
import { ChoroplethMapProps } from "./ChoroplethMap";

const ChoroplethMap = dynamic(
  () => import("./ChoroplethMap").then((mod) => mod.default),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

const ChoroplethMapWrapper = ({ dengueData }: ChoroplethMapProps) => {
  return <ChoroplethMap dengueData={dengueData} />;
};

export default ChoroplethMapWrapper;
