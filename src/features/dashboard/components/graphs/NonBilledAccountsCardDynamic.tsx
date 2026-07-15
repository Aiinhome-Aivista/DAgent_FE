import React from "react";

const mockData = [
  { title: "Dealer", value: "22%" },
  { title: "Fleets", value: "44%" },
  { title: "Distribution", value: "18%" },
  { title: "Brand Shops", value: "7%" },
];

export const NonBilledAccountsCardDynamic = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Non Billed Accounts %
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockData.map((item, index) => (
          <div
            key={index}
            className="bg-yellow-400 rounded-xl p-6 flex flex-col items-center justify-center gap-4"
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
