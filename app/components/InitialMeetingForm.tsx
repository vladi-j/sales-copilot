import { useState } from 'react';
import { InitialMeetingData } from '../types/forms';

interface InitialMeetingFormProps {
  onSubmit: (data: InitialMeetingData) => void;
  onSkip: () => void;
}

const FormField = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <textarea
      className="w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const PronounSelect = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Preferred Pronouns
    </label>
    <select
      className="w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select pronouns</option>
      <option value="He">He/Him</option>
      <option value="She">She/Her</option>
      <option value="They">They/Them</option>
    </select>
  </div>
);

export const InitialMeetingForm = ({ onSubmit, onSkip }: InitialMeetingFormProps) => {
  const [formData, setFormData] = useState<InitialMeetingData>({});

  const updateField = (field: keyof InitialMeetingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Pre-conversation Information</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}>
        {/* Owner Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Owner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="First Name"
              value={formData.ownerFirstName || ''}
              onChange={(value) => updateField('ownerFirstName', value)}
            />
            <FormField
              label="Last Name"
              value={formData.ownerLastName || ''}
              onChange={(value) => updateField('ownerLastName', value)}
            />
            <PronounSelect
              value={formData.ownerPronouns || ''}
              onChange={(value) => updateField('ownerPronouns', value)}
            />
          </div>
        </div>

        {/* Website Information Section */}
        <h3 className="text-lg font-medium text-white mb-4">Website Information</h3>
        <div className="grid grid-cols-1 gap-6">
          <FormField
            label="When was your current website originally created, and when was it last updated?"
            value={formData.websiteCreationDate || ''}
            onChange={(value) => updateField('websiteCreationDate', value)}
          />
          <FormField
            label="What was your main goal when you first created the website?"
            value={formData.websiteGoal || ''}
            onChange={(value) => updateField('websiteGoal', value)}
          />
          <FormField
            label="How's your industry or sector doing overall at the moment?"
            value={formData.industrySituation || ''}
            onChange={(value) => updateField('industrySituation', value)}
          />
          <FormField
            label="How many new clients would you estimate came through your website in the past month?"
            value={formData.monthlyClients || ''}
            onChange={(value) => updateField('monthlyClients', value)}
          />
          <FormField
            label="How does that compare to last year?"
            value={formData.yearComparison || ''}
            onChange={(value) => updateField('yearComparison', value)}
          />
          <FormField
            label="What are insights from the audit?"
            value={formData.auditInsights || ''}
            onChange={(value) => updateField('auditInsights', value)}
          />
          <FormField
            label="In your opinion, what's the main purpose of your website?"
            value={formData.websitePurpose || ''}
            onChange={(value) => updateField('websitePurpose', value)}
          />
          <FormField
            label="What do you wish it could do better?"
            value={formData.improvementWishes || ''}
            onChange={(value) => updateField('improvementWishes', value)}
          />
          <FormField
            label="Who is your main target group or buyer?"
            value={formData.targetGroup || ''}
            onChange={(value) => updateField('targetGroup', value)}
          />
          <FormField
            label="Who would you most like to reach online?"
            value={formData.onlineTargetAudience || ''}
            onChange={(value) => updateField('onlineTargetAudience', value)}
          />
          <FormField
            label="Are there specific features or sections you feel are missing or absolutely must be on the website?"
            value={formData.missingFeatures || ''}
            onChange={(value) => updateField('missingFeatures', value)}
          />
          <FormField
            label="Have you already considered any updates or changes?"
            value={formData.plannedUpdates || ''}
            onChange={(value) => updateField('plannedUpdates', value)}
          />
          <FormField
            label="Are you interested in attracting more customers through Google searches? Particularly private customers (B2C)?"
            value={formData.googleSearchInterest || ''}
            onChange={(value) => updateField('googleSearchInterest', value)}
          />
        </div>
        
        {/* Additional Information Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Additional Information</h3>
          <FormField
            label="Any other information that might be useful?"
            value={formData.otherInformation || ''}
            onChange={(value) => updateField('otherInformation', value)}
          />
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Conversation
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white"
          >
            Skip Form
          </button>
        </div>
      </form>
    </div>
  );
}; 