import { type FC } from 'react';
import { SalesAnalysis } from './useSalesAnalysis';

interface Props {
  analysis: SalesAnalysis | null;
}

export const RightColumnAnalysis: FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="h-full overflow-y-auto">
      {/* Critical Attention */}
      <div className="mb-6">
        <h4 className="text-[#007aff] font-medium text-sm mb-3">Critical Attention</h4>
        <div className="bg-[#f2f2f7] p-4 rounded-xl mb-3">
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Top Risks</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            {analysis.criticalAttention.topRisk?.map((risk, index) => (
              <li key={index} className="text-[#3a3a3c] text-sm">{risk}</li>
            ))}
          </ul>
        </div>
        <div className="bg-[#f2f2f7] p-4 rounded-xl">
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Key Opportunities</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            {analysis.criticalAttention.keyOpportunities?.map((opportunity, index) => (
              <li key={index} className="text-[#3a3a3c] text-sm">{opportunity}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Current Focus */}
      <div className="mb-6">
        <h4 className="text-[#007aff] font-medium text-sm mb-3">Current Focus</h4>
        <div className="bg-[#f2f2f7] p-4 rounded-xl">
          <ul className="list-disc pl-4 space-y-1">
            {analysis.currentFocus?.map((item, index) => (
              <li key={index} className="text-[#3a3a3c] text-sm">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Situation */}
      <div className="mb-6">
        <h4 className="text-[#007aff] font-medium text-sm mb-3">Situation</h4>
        <div className="bg-[#f2f2f7] p-4 rounded-xl">
          <ul className="list-disc pl-4 space-y-1">
            {analysis.situation?.map((item, index) => (
              <li key={index} className="text-[#3a3a3c] text-sm">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stakeholders */}
      <div className="mb-6">
        <h4 className="text-[#007aff] font-medium text-sm mb-3">Stakeholders</h4>
        <div className="bg-[#f2f2f7] p-4 rounded-xl">
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Decision Maker</p>
          <p className="text-[#3a3a3c] mb-3 text-sm">{analysis.stakeholders.decisionMaker}</p>
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Other Players</p>
          <p className="text-[#3a3a3c] text-sm">{analysis.stakeholders.otherPlayers?.join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  );
}; 