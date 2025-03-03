import { type FC } from 'react';
import { SalesAnalysis } from './useSalesAnalysis';

interface Props {
  analysis: SalesAnalysis | null;
}

export const LeftColumnAnalysis: FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white h-full overflow-y-auto">      
      {/* Objections */}
      <div className="mb-6">
        <h4 className="text-blue-400 font-medium mb-2">Objections:</h4>
        {analysis.objections.map((objection, index) => (
          <div key={index} className="mb-3 bg-gray-700 p-3 rounded">
            <p className="text-gray-300 font-medium">Concern:</p>
            <p className="text-gray-200 mb-2">{objection.concern}</p>
            <p className="text-gray-300 font-medium">Response:</p>
            <p className="text-gray-200">{objection.response}</p>
          </div>
        ))}
      </div>

      {/* Immediate Actions */}
      <div className="mb-6">
        <h4 className="text-blue-400 font-medium mb-2">Immediate Actions:</h4>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-gray-300 font-medium">Question to Ask:</p>
          <p className="text-gray-200 mb-2">{analysis.immediateActions.questionToAsk}</p>
          <p className="text-gray-300 font-medium">Topic to Emphasize:</p>
          <p className="text-gray-200 mb-2">{analysis.immediateActions.topicToEmphasize}</p>
          <p className="text-gray-300 font-medium">Suggested Close:</p>
          <p className="text-gray-200">{analysis.immediateActions.suggestedClose}</p>
        </div>
      </div>
    </div>
  );
}; 