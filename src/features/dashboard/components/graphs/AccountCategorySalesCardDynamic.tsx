import React from "react";

const mockData = [
  { title: "Dealer", value: "192.57 (58 %)" },
  { title: "Fleets", value: "29.45 (9 %)" },
  { title: "Distribution", value: "10.97 (3 %)" },
  { title: "Brand Shops", value: "79.48 (24 %)" },
];

export const AccountCategorySalesCardDynamic = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Actual Sales by Account Category (Cr)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockData.map((item, index) => (
          <div
            key={index}
            className="bg-orange-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4"
          >
            <span className="font-bold text-slate-800">{item.title}</span>
            <span className="text-slate-800 text-2xl font-normal">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
