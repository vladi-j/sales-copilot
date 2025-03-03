import { type FC } from 'react';
import { SalesAnalysis } from './useSalesAnalysis';

interface Props {
  analysis: SalesAnalysis | null;
}

export const SalesAnalysisDisplay: FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h3 className="text-lg font-semibold mb-4">Sales Analysis</h3>
      
      {/* Situation */}
      <div className="mb-4">
        <h4 className="text-blue-400 font-medium mb-2">Situation:</h4>
        <ul className="list-disc pl-4 space-y-1">
          {analysis.situation.map((item, index) => (
            <li key={index} className="text-gray-200">{item}</li>
          ))}
        </ul>
      </div>

      {/* Current Focus */}
      <div className="mb-4">
        <h4 className="text-blue-400 font-medium mb-2">Current Focus:</h4>
        <ul className="list-disc pl-4 space-y-1">
          {analysis.currentFocus.map((item, index) => (
            <li key={index} className="text-gray-200">{item}</li>
          ))}
        </ul>
      </div>

      {/* Stakeholders */}
      <div className="mb-4">
        <h4 className="text-blue-400 font-medium mb-2">Stakeholders:</h4>
        <p className="text-gray-200">Decision Maker: {analysis.stakeholders.decisionMaker}</p>
        <p className="text-gray-200">Other Players: {analysis.stakeholders.otherPlayers?.join(', ')}</p>
      </div>

      {/* Critical Attention */}
      <div className="mb-4">
        <h4 className="text-blue-400 font-medium mb-2">Critical Attention:</h4>
        <div className="mb-2">
          <p className="text-gray-300 font-medium">Top Risks:</p>
          <ul className="list-disc pl-4 space-y-1">
            {analysis.criticalAttention.topRisk.map((risk, index) => (
              <li key={index} className="text-gray-200">{risk}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-gray-300 font-medium">Key Opportunities:</p>
          <ul className="list-disc pl-4 space-y-1">
            {analysis.criticalAttention.keyOpportunities.map((opportunity, index) => (
              <li key={index} className="text-gray-200">{opportunity}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Objections */}
      <div className="mb-4">
        <h4 className="text-blue-400 font-medium mb-2">Objections:</h4>
        {analysis.objections.map((objection, index) => (
          <div key={index} className="mb-2">
            <p className="text-gray-300">Concern: {objection.concern}</p>
            <p className="text-gray-200">Response: {objection.response}</p>
          </div>
        ))}
      </div>

      {/* Immediate Actions */}
      <div className="mb-4">
        <h4 className="text-blue-400 font-medium mb-2">Immediate Actions:</h4>
        <p className="text-gray-200">Question: {analysis.immediateActions.questionToAsk}</p>
        <p className="text-gray-200">Emphasize: {analysis.immediateActions.topicToEmphasize}</p>
        <p className="text-gray-200">Close: {analysis.immediateActions.suggestedClose}</p>
      </div>
    </div>
  );
}; 