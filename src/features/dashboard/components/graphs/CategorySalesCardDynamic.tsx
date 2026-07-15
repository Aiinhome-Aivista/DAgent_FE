import React from "react";

const mockData = [
  { title: "TBB", value: "%" },
  { title: "TBR", value: "DIF0%" },
  { title: "SCV B", value: "%" },
  { title: "LCVB", value: "DIF0%" },
  { title: "PCR", value: "DIF0%" },
  { title: "2/3W", value: "DIF0%" },
  { title: "FARM", value: "%" },
  { title: "SCVR", value: "DIF0%" },
  { title: "LCVR", value: "DIF0%" },
];

export const CategorySalesCardDynamic = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Category Sales
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mockData.map((item, index) => (
          <div key={index} className="bg-slate-100 rounded-md p-4 flex flex-col items-center justify-center gap-2">
            <span className="font-bold text-slate-800">{item.title}</span>
            <div className="bg-white rounded-md w-full px-3 py-1 border border-slate-200">
              <span className="text-slate-600 text-sm font-medium">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
