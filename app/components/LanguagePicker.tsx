interface LanguagePickerProps {
  selectedLanguage: string;
  onChange: (language: string) => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({ selectedLanguage, onChange }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <label className="flex items-center space-x-2">
        <span className="text-sm text-gray-300">Speech Recognition Language:</span>
        <select
          value={selectedLanguage}
          onChange={(e) => onChange(e.target.value)}
          className="ml-2 bg-gray-800 text-white rounded-md border-gray-700 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="lv">Latvian</option>
          <option value="et">Estonian</option>
          <option value="lt">Lithuanian</option>
        </select>
      </label>
    </div>
  );
}; 