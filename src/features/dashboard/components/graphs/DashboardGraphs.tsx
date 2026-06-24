import React from "react";
import { YearComparisonChartDynamic } from "./YearComparisonChartDynamic";
import { ZonePieChartDynamic } from "./ZonePieChartDynamic";
import { TyreSalesChartDynamic } from "./TyreSalesChartDynamic";
import { YoYGrowthGraph } from "./YoYGrowthGraph";
import { IndiaMapGraph } from "./IndiaCoverageMap";

export const DashboardGraphs = () => {
  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      {/* Year-wise Comparison Filterable Chart */}
      <YearComparisonChartDynamic />

      {/* Future use: YoY Growth & India Coverage Map (currently commented out) */}
      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YoYGrowthGraph />
        <IndiaMapGraph />
      </div>
      */}

      <div className="grid grid-cols-1 gap-6">
        {/* Sales by Zone */}
        <ZonePieChartDynamic />

        {/* Top 10 Tyre Types by Sales */}
        <TyreSalesChartDynamic />
      </div>
    </div>
  );
};
