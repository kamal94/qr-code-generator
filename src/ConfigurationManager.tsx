import React, { useState, useRef } from 'react';
import { FaCopy, FaDownload, FaUpload, FaFileImport, FaFileExport, FaCheck, FaChevronUp, FaChevronDown } from 'react-icons/fa';

// Color palette for consistent theming using Tailwind colors
const COLORS = {
  configManager: {
    header: 'bg-gray-200',
    headerText: 'text-gray-700',
    activeText: 'text-gray-700',
    activeBorder: 'border-gray-500',
    button: 'bg-gray-400',
    buttonHover: 'hover:bg-gray-500',
  },
};

interface ConfigurationManagerProps {
  getConfigObject: () => any;
  applyConfig: (config: any) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({
  getConfigObject,
  applyConfig,
  showToast,
}) => {
  const [configTab, setConfigTab] = useState<'export' | 'import'>('export');
  const [configPaste, setConfigPaste] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const configFileInputRef = useRef<HTMLInputElement>(null);

  const onCopyConfigClick = async () => {
    const json = JSON.stringify(getConfigObject(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showToast('Configuration copied to clipboard!', 'success');
    } catch (e) {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = json;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      try {
        document.execCommand('copy');
        showToast('Configuration copied to clipboard!', 'success');
      } catch (err) {
        showToast('Failed to copy configuration', 'error');
      } finally {
        document.body.removeChild(tempTextArea);
      }
    }
  };

  const onSaveConfigClick = () => {
    const json = JSON.stringify(getConfigObject(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'qr-config.json';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Configuration saved successfully!', 'success');
  };

  const onApplyPastedConfig = () => {
    try {
      const parsed = JSON.parse(configPaste);
      applyConfig(parsed);
      setConfigPaste('');
      showToast('Configuration applied successfully!', 'success');
    } catch (e) {
      showToast('Invalid JSON format. Please check your configuration.', 'error');
    }
  };

  const onConfigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        applyConfig(parsed);
        showToast(`Configuration loaded from ${file.name}`, 'success');
      } catch (err) {
        showToast('Failed to parse configuration file', 'error');
      } finally {
        e.currentTarget.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      showToast('Please drop a JSON file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        applyConfig(parsed);
        showToast(`Configuration loaded from ${file.name}`, 'success');
      } catch (err) {
        showToast('Failed to parse configuration file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Collapsible Configuration Manager */}
      <div 
        className="w-full bg-[#f8f9fa] border-t border-[#e9ecef] transition-all duration-700 ease-in-out overflow-hidden"
        style={{
          maxHeight: isConfigExpanded ? '400px' : '0px',
        }}
      >
        
        <div className="flex bg-[#e9ecef] border-b-2 border-[#dee2e6]">
          <button 
            className={`flex-1 py-2 px-4 bg-transparent border-none border-b-[3px] text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 hover:bg-white/50 hover:text-gray-700 ${configTab === 'export' ? `bg-white ${COLORS.configManager.activeText} ${COLORS.configManager.activeBorder}` : 'text-gray-600 border-b-transparent'}`}
            onClick={() => setConfigTab('export')}
          >
            <FaFileExport /> Export
          </button>
          <button 
            className={`flex-1 py-2 px-4 bg-transparent border-none border-b-[3px] text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 hover:bg-white/50 hover:text-gray-700 ${configTab === 'import' ? `bg-white ${COLORS.configManager.activeText} ${COLORS.configManager.activeBorder}` : 'text-gray-600 border-b-transparent'}`}
            onClick={() => setConfigTab('import')}
          >
            <FaFileImport /> Import
          </button>
        </div>
        
        {configTab === 'export' && (
          <div className="p-5 bg-white">
            <p className="m-0 mb-4 text-[13px] text-[#6c757d] text-center">Save or copy your current QR code configuration</p>
            <div className="flex flex-col gap-2.5">
              <button className={`${COLORS.configManager.button} ${COLORS.configManager.buttonHover} text-white border-none rounded-lg py-3 px-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-sm hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-md active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`} onClick={onCopyConfigClick}>
                <FaCopy /> Copy to Clipboard
              </button>
              <button className={`${COLORS.configManager.button} ${COLORS.configManager.buttonHover} text-white border-none rounded-lg py-3 px-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-sm hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-md active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`} onClick={onSaveConfigClick}>
                <FaDownload /> Download File
              </button>
            </div>
          </div>
        )}
        
        {configTab === 'import' && (
          <div className="p-2 bg-white">
            <div 
              className={`border-2 rounded-xl py-5 px-5 text-center cursor-pointer transition-all duration-300 ease-in-out ${isDragging ? 'border-solid border-gray-500 bg-gray-100 scale-[1.02]' : 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => configFileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <FaUpload className={`text-[24px] mb-2 ${COLORS.configManager.activeText}`} />
                <p className="m-0 mb-1 text-sm font-medium text-[#495057]">
                  {isDragging ? 'Drop file here' : 'Upload a stored QR configuration'}
                </p>
              </div>
              <input 
                type="file" 
                ref={configFileInputRef}
                accept="application/json,.json" 
                onChange={onConfigFileChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="flex items-center text-center my-5 text-[#adb5bd] text-xs font-medium before:content-[''] before:flex-1 before:border-b before:border-[#dee2e6] after:content-[''] after:flex-1 after:border-b after:border-[#dee2e6]">
              <span className="px-3">OR</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full min-h-[110px] font-mono text-xs border-2 border-gray-200 rounded-lg p-3 resize-y text-gray-700 bg-gray-50 transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
                placeholder="Paste a stored QR configuration here..."
                value={configPaste}
                onChange={(e) => setConfigPaste(e.target.value)}
              />
              <button 
                className={`${COLORS.configManager.button} ${COLORS.configManager.buttonHover} text-white border-none rounded-lg py-3 px-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-sm hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-md active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={onApplyPastedConfig}
                disabled={!configPaste.trim()}
              >
                <FaCheck /> Apply Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Footer */}
      <button
        onClick={() => setIsConfigExpanded(!isConfigExpanded)}
        className={`w-full ${COLORS.configManager.button} ${COLORS.configManager.buttonHover} text-white border-none py-3 px-5 cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 font-medium text-sm active:scale-[0.98]`}
      >
        {isConfigExpanded ? (
          <>
            <FaChevronDown /> Hide Configuration Manager
          </>
        ) : (
          <>
            <FaChevronUp /> Show Configuration Manager
          </>
        )}
      </button>
    </>
  );
};
