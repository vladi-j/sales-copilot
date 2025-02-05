interface TextCorrectionToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const TextCorrectionToggle: React.FC<TextCorrectionToggleProps> = ({ checked, onChange }) => {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg p-6">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-300">
          I want to send my text for word, terminology and punctuation correction. Overall text should be better, but some words might be invented. Additional credits will be consumed!
        </span>
      </label>
    </div>
  );
}; 