import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles globally

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="loading-editor bg-gray-700 rounded-lg min-h-[200px] flex items-center justify-center text-gray-400">Loading editor...</div>
});

interface SalesScriptProps {
  initialScript?: string;
  onChange?: (script: string) => void;
  readOnly?: boolean;
  height?: string;
}

export const SalesScript: React.FC<SalesScriptProps> = ({ 
  initialScript = "", 
  onChange,
  readOnly = false,
  height = "300px" // Default height
}) => {
  const [salesScript, setSalesScript] = useState<string>(initialScript);
  const [isMounted, setIsMounted] = useState(false);

  // Only render on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update local state when initialScript prop changes
  useEffect(() => {
    setSalesScript(initialScript);
  }, [initialScript]);

  const handleChange = (content: string) => {
    setSalesScript(content);
    if (onChange) {
      onChange(content);
    }
  };

  // Quill editor modules/formats configuration
  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false, // Improves paste behavior
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
  ];

  return (
    <div className="mb-4">
      <div className="text-white text-sm font-medium mb-2">Sales Script</div>
      {isMounted ? (
        <div 
          className={`bg-gray-700 rounded-lg ${readOnly ? 'quill-readonly' : ''}`}
          style={{ height }}
        >
          <ReactQuill
            theme="snow"
            value={salesScript}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            readOnly={readOnly}
            placeholder="Enter your sales script here with any formatting, numbering, or bullet points you need..."
            className="text-white quill-dark h-full"
          />
        </div>
      ) : (
        <div 
          className="loading-editor bg-gray-700 rounded-lg flex items-center justify-center text-gray-400"
          style={{ height }}
        >
          Loading editor...
        </div>
      )}
      
      {/* Add custom styles for the Quill editor */}
      <style jsx global>{`
        .quill-dark {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .quill-dark .ql-toolbar {
          background-color: #4B5563;
          border-color: #374151;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        
        .quill-dark .ql-container {
          background-color: #374151;
          color: white;
          border-color: #374151;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          flex: 1;
          overflow-y: auto;
        }
        
        .quill-dark .ql-editor {
          min-height: 100%;
          max-height: 100%;
          overflow-y: auto;
        }
        
        .quill-dark .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .quill-dark .ql-stroke {
          stroke: white;
        }
        
        .quill-dark .ql-fill {
          fill: white;
        }
        
        .quill-dark .ql-picker {
          color: white;
        }
        
        .quill-dark .ql-picker-options {
          background-color: #4B5563;
        }
        
        .quill-readonly .ql-toolbar {
          display: none;
        }
        
        .quill-readonly .ql-container {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}; 