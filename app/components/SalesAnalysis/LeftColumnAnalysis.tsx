import { type FC } from 'react';
import { SalesAnalysis } from './useSalesAnalysis';

interface Props {
  analysis: SalesAnalysis | null;
}

export const LeftColumnAnalysis: FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="h-full overflow-y-auto">      
      {/* Objections */}
      <div className="mb-6">
        <h4 className="text-[#007aff] font-medium text-sm mb-3">Objections</h4>
        {analysis.objections.map((objection, index) => (
          <div key={index} className="mb-4 bg-[#f2f2f7] p-4 rounded-xl">
            <p className="text-[#1c1c1e] font-medium text-sm mb-1">Concern</p>
            <p className="text-[#3a3a3c] mb-3 text-sm">{objection.concern}</p>
            <p className="text-[#1c1c1e] font-medium text-sm mb-1">Response</p>
            <p className="text-[#3a3a3c] text-sm">{objection.response}</p>
          </div>
        ))}
      </div>

      {/* Immediate Actions */}
      <div className="mb-6">
        <h4 className="text-[#007aff] font-medium text-sm mb-3">Immediate Actions</h4>
        <div className="bg-[#f2f2f7] p-4 rounded-xl">
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Question to Ask</p>
          <p className="text-[#3a3a3c] mb-3 text-sm">{analysis.immediateActions.questionToAsk}</p>
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Topic to Emphasize</p>
          <p className="text-[#3a3a3c] mb-3 text-sm">{analysis.immediateActions.topicToEmphasize}</p>
          <p className="text-[#1c1c1e] font-medium text-sm mb-1">Suggested Close</p>
          <p className="text-[#3a3a3c] text-sm">{analysis.immediateActions.suggestedClose}</p>
        </div>
      </div>
    </div>
  );
}; 