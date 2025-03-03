import { type FC } from 'react';
import { SalesAnalysis } from './useSalesAnalysis';

interface Props {
  analysis: SalesAnalysis | null;
}

export const RightColumnAnalysis: FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white h-full overflow-y-auto">

      {/* Critical Attention */}
      <div className="mb-6">
        <h4 className="text-blue-400 font-medium mb-2">Critical Attention:</h4>
        <div className="bg-gray-700 p-3 rounded mb-3">
          <p className="text-gray-300 font-medium">Top Risks:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            {analysis.criticalAttention.topRisk?.map((risk, index) => (
              <li key={index} className="text-gray-200">{risk}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-gray-300 font-medium">Key Opportunities:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            {analysis.criticalAttention.keyOpportunities?.map((opportunity, index) => (
              <li key={index} className="text-gray-200">{opportunity}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Current Focus */}
      <div className="mb-6">
        <h4 className="text-blue-400 font-medium mb-2">Current Focus:</h4>
        <div className="bg-gray-700 p-3 rounded">
          <ul className="list-disc pl-4 space-y-1">
            {analysis.currentFocus?.map((item, index) => (
              <li key={index} className="text-gray-200">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Situation */}
      <div className="mb-6">
        <h4 className="text-blue-400 font-medium mb-2">Situation:</h4>
        <div className="bg-gray-700 p-3 rounded">
          <ul className="list-disc pl-4 space-y-1">
            {analysis.situation?.map((item, index) => (
              <li key={index} className="text-gray-200">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stakeholders */}
      <div className="mb-6">
        <h4 className="text-blue-400 font-medium mb-2">Stakeholders:</h4>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-gray-300 font-medium">Decision Maker:</p>
          <p className="text-gray-200 mb-2">{analysis.stakeholders.decisionMaker}</p>
          <p className="text-gray-300 font-medium">Other Players:</p>
          <p className="text-gray-200">{analysis.stakeholders.otherPlayers?.join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  );
}; 