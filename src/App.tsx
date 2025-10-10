import React, { useState, useEffect, useRef } from 'react';
import { FaGithub, FaCopy, FaDownload, FaUpload, FaFileImport, FaFileExport, FaCheck, FaTimes } from 'react-icons/fa';
import QRCodeStyling from 'qr-code-styling';
import { createQRCanvas, downloadCanvas } from './qrCanvas';

const App: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [bgColor, setBgColor] = useState('#f0f8ff');
  const [dotColor, setDotColor] = useState('#1a2a45');
  const [dotStyle, setDotStyle] = useState<'square' | 'dots' | 'rounded'>('rounded');
  const [cornerSquareStyle, setCornerSquareStyle] = useState<'square' | 'extra-rounded' | 'dot'>('extra-rounded');
  const [cornerDotStyle, setCornerDotStyle] = useState<'square' | 'dot'>('dot');
  const [centerImage, setCenterImage] = useState<string | null>(null);
  const [qrMargin, setQrMargin] = useState(20);
  const [downloadSize, setDownloadSize] = useState(1000);
  const [backgroundBorderStyle, setBackgroundBorderStyle] = useState('rounded');
  const [borderRadius, setBorderRadius] = useState(20);
  const [borderWidth, setBorderWidth] = useState(0);
  const [configPaste, setConfigPaste] = useState('');
  const [configTab, setConfigTab] = useState<'export' | 'import'>('export');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [isDragging, setIsDragging] = useState(false);

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeContainerRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCode.current = new QRCodeStyling({
        width: 300,
        height: 300,
        margin: 0,
        data: url,
        image: centerImage || '',
        dotsOptions: {
          color: dotColor,
          type: dotStyle,
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: cornerSquareStyle,
        },
        cornersDotOptions: {
          type: cornerDotStyle,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
        },
      });
      qrCode.current.append(qrCodeRef.current);
    }
  }, [url, bgColor, dotColor, dotStyle, cornerSquareStyle, cornerDotStyle, centerImage]);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: url,
        margin: 0,
        dotsOptions: {
          color: dotColor,
          type: dotStyle,
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: cornerSquareStyle,
        },
        cornersDotOptions: {
          type: cornerDotStyle,
        },
        image: centerImage || '',
        imageOptions: {
          crossOrigin: 'anonymous',
        },
      });
    }
  }, [url, bgColor, dotColor, dotStyle, cornerSquareStyle, centerImage, cornerDotStyle]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCenterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onRemoveImageClick = () => {
    setCenterImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (qrCode.current) {
      qrCode.current.update({ image: '' });
    }
  };

  const isOneOf = <T,>(val: any, allowed: readonly T[]): val is T =>
    allowed.includes(val);

  const applyConfig = (cfg: any) => {
    if (!cfg || typeof cfg !== 'object') return;
    if (typeof cfg.url === 'string') setUrl(cfg.url);
    if (typeof cfg.bgColor === 'string') setBgColor(cfg.bgColor);
    if (typeof cfg.dotColor === 'string') setDotColor(cfg.dotColor);
    if (isOneOf(cfg.dotStyle, ['square', 'dots', 'rounded'] as const)) setDotStyle(cfg.dotStyle);
    if (isOneOf(cfg.cornerSquareStyle, ['square', 'extra-rounded', 'dot'] as const)) setCornerSquareStyle(cfg.cornerSquareStyle);
    if (isOneOf(cfg.cornerDotStyle, ['square', 'dot'] as const)) setCornerDotStyle(cfg.cornerDotStyle);
    if (typeof cfg.centerImage === 'string' || cfg.centerImage === null) setCenterImage(cfg.centerImage);
    if (Number.isFinite(cfg.qrMargin)) setQrMargin(Math.max(0, Math.min(50, Number(cfg.qrMargin))));
    if (Number.isFinite(cfg.downloadSize)) setDownloadSize(Number(cfg.downloadSize));
    if (typeof cfg.backgroundBorderStyle === 'string') setBackgroundBorderStyle(cfg.backgroundBorderStyle);
    if (Number.isFinite(cfg.borderRadius)) setBorderRadius(Math.max(0, Math.min(50, Number(cfg.borderRadius))));
    if (Number.isFinite(cfg.borderWidth)) setBorderWidth(Math.max(0, Math.min(20, Number(cfg.borderWidth))));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

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

  const getConfigObject = () => ({
    url,
    bgColor,
    dotColor,
    dotStyle,
    cornerSquareStyle,
    cornerDotStyle,
    centerImage,
    qrMargin,
    downloadSize,
    backgroundBorderStyle,
    borderRadius,
    borderWidth,
  });


  const onDownloadClick = async () => {
    const tempQrCode = new QRCodeStyling({
      ...qrCode.current?._options,
      width: downloadSize,
      height: downloadSize,
      margin: 0, // We handle the margin via padding on the canvas
    });

    const rawData = await tempQrCode.getRawData('png');
    if (!rawData) return;

    try {
      const canvas = await createQRCanvas({
        qrImageBlob: rawData as Blob,
        bgColor,
        dotColor,
        downloadSize,
        qrMargin,
        borderRadius,
        borderWidth,
        backgroundBorderStyle: backgroundBorderStyle as 'rounded' | 'square',
      });

      downloadCanvas(canvas);
    } catch (error) {
      console.error('Failed to create QR code:', error);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-10 p-5 pb-20 max-w-[1200px] w-full justify-center">
        <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-[30px] flex flex-col gap-[25px] w-full max-w-[400px]">
          <h1 className="text-2xl font-semibold text-[#333] m-0 mb-2.5 text-center">QR Code Generator</h1>
          <div className="flex flex-col gap-2">
            <label htmlFor="url" className="font-medium text-[#555]">Target URL</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 border border-[#ccc] rounded text-base box-border"
            />
          </div>
          <div className="flex gap-[15px]">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="bg-color" className="font-medium text-[#555]">Background Color</label>
              <input
                type="color"
                id="bg-color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 p-[5px] border border-[#ccc] rounded text-base box-border"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="dot-color" className="font-medium text-[#555]">Dot Color</label>
              <input
                type="color"
                id="dot-color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="w-full h-10 p-[5px] border border-[#ccc] rounded text-base box-border"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="dot-style" className="font-medium text-[#555]">Dot Shape</label>
            <select
              id="dot-style"
              value={dotStyle}
              onChange={(e) => setDotStyle(e.target.value as 'square' | 'dots' | 'rounded')}
              className="w-full p-2.5 border border-[#ccc] rounded text-base box-border"
            >
              <option value="square">Square</option>
              <option value="dots">Circle</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="corner-style" className="font-medium text-[#555]">Border Corner Shape</label>
            <select
              id="corner-style"
              value={cornerSquareStyle}
              onChange={(e) => setCornerSquareStyle(e.target.value as 'square' | 'extra-rounded' | 'dot')}
              className="w-full p-2.5 border border-[#ccc] rounded text-base box-border"
            >
              <option value="square">Square</option>
              <option value="extra-rounded">Rounded</option>
              <option value="dot">Circle</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="corner-dot-style" className="font-medium text-[#555]">Corner Dot Shape</label>
            <select
              id="corner-dot-style"
              value={cornerDotStyle}
              onChange={(e) => setCornerDotStyle(e.target.value as 'square' | 'dot')}
              className="w-full p-2.5 border border-[#ccc] rounded text-base box-border"
            >
              <option value="square">Square</option>
              <option value="dot">Dot</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="background-border-style" className="font-medium text-[#555]">Background Border Style</label>
            <select
              id="background-border-style"
              value={backgroundBorderStyle}
              onChange={(e) => setBackgroundBorderStyle(e.target.value)}
              className="w-full p-2.5 border border-[#ccc] rounded text-base box-border"
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="border-width" className="font-medium text-[#555]">Border Line Thickness</label>
            <input
              type="range"
              id="border-width"
              min="0"
              max="20"
              value={borderWidth}
              onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {backgroundBorderStyle === 'rounded' && (
            <div className="flex flex-col gap-2">
              <label htmlFor="border-radius" className="font-medium text-[#555]">Border Radius</label>
              <input
                type="range"
                id="border-radius"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="margin" className="font-medium text-[#555]">Border Padding</label>
            <input
              type="range"
              id="margin"
              min="0"
              max="50"
              value={qrMargin}
              onChange={(e) => setQrMargin(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[#555]">Center Image</label>
            <div className="flex flex-col gap-2.5">
              <div className="relative overflow-hidden inline-block w-full cursor-pointer">
                <div className="bg-[#007bff] text-white border-none rounded p-2.5 text-center cursor-pointer font-medium transition-colors duration-300 hover:bg-[#0056b3]">Upload  Center Image</div>
                <input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer" />
              </div>
              {centerImage && (
                <button className="bg-[#f8f9fa] text-[#dc3545] border border-[#dc3545] rounded p-2.5 text-base font-medium cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#dc3545] hover:text-white" onClick={onRemoveImageClick}>
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-[30px] flex flex-col items-center justify-center gap-5 w-full max-w-[400px]">
          <div
            ref={qrCodeContainerRef}
            style={{
              backgroundColor: bgColor,
              padding: `${qrMargin}px`,
              display: 'inline-block',
              borderRadius: backgroundBorderStyle === 'rounded' ? `${borderRadius}px` : '0',
              border: `${borderWidth}px solid ${dotColor}`,
            }}
          >
            <div ref={qrCodeRef}></div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="download-size" className="font-medium text-[#555]">Download Resolution</label>
            <select
              id="download-size"
              value={downloadSize}
              onChange={(e) => setDownloadSize(parseInt(e.target.value, 10))}
              className="w-full p-2.5 border border-[#ccc] rounded text-base box-border"
            >
              <option value="512">512x512</option>
              <option value="1024">1024x1024</option>
              <option value="2048">2048x2048</option>
            </select>
          </div>
          <button className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white border-none rounded-lg py-3.5 px-5 text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out w-full flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(79,172,254,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,172,254,0.4)] active:translate-y-0" onClick={onDownloadClick}>
            <FaDownload /> Download QR Code
          </button>
          
          <div className="mt-20 w-full bg-[#f8f9fa] rounded-xl overflow-hidden border border-[#e9ecef]">
            <div className="px-5 py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] border-b border-white/10">
              <h3 className="m-0 text-base font-semibold text-white text-center">Configuration Manager</h3>
            </div>
            <div className="flex bg-[#e9ecef] border-b-2 border-[#dee2e6]">
              <button 
                className={`flex-1 py-3 px-4 bg-transparent border-none border-b-[3px] border-b-transparent text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 hover:bg-white/50 hover:text-[#495057] ${configTab === 'export' ? 'bg-white text-[#667eea] !border-b-[#667eea]' : 'text-[#6c757d]'}`}
                onClick={() => setConfigTab('export')}
              >
                <FaFileExport /> Export
              </button>
              <button 
                className={`flex-1 py-3 px-4 bg-transparent border-none border-b-[3px] border-b-transparent text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 hover:bg-white/50 hover:text-[#495057] ${configTab === 'import' ? 'bg-white text-[#667eea] !border-b-[#667eea]' : 'text-[#6c757d]'}`}
                onClick={() => setConfigTab('import')}
              >
                <FaFileImport /> Import
              </button>
            </div>
            
            {configTab === 'export' && (
              <div className="p-5 bg-white">
                <p className="m-0 mb-4 text-[13px] text-[#6c757d] text-center">Save or copy your current QR code settings</p>
                <div className="flex flex-col gap-2.5">
                  <button className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-lg py-3 px-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(102,126,234,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_12px_rgba(102,126,234,0.35)] active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onCopyConfigClick}>
                    <FaCopy /> Copy to Clipboard
                  </button>
                  <button className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-lg py-3 px-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(102,126,234,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_12px_rgba(102,126,234,0.35)] active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onSaveConfigClick}>
                    <FaDownload /> Download File
                  </button>
                </div>
              </div>
            )}
            
            {configTab === 'import' && (
              <div className="p-5 bg-white">
                <p className="m-0 mb-4 text-[13px] text-[#6c757d] text-center">Restore settings from a saved configuration</p>
                
                <div 
                  className={`border-2 ${isDragging ? 'border-solid border-[#667eea] bg-gradient-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] scale-[1.02]' : 'border-dashed border-[#cbd5e0] bg-[#f8f9fa] hover:border-[#667eea] hover:bg-[#f0f4ff]'} rounded-xl py-10 px-5 text-center cursor-pointer transition-all duration-300 ease-in-out`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => configFileInputRef.current?.click()}
                >
                  <FaUpload className="text-[32px] text-[#667eea] mb-3" />
                  <p className="m-0 mb-1 text-sm font-medium text-[#495057]">
                    {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="m-0 text-xs text-[#6c757d]">JSON files only</p>
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
                    className="w-full min-h-[120px] font-mono text-xs border-2 border-[#e9ecef] rounded-lg p-3 resize-y text-[#495057] bg-[#f8f9fa] transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] placeholder:text-[#adb5bd]"
                    placeholder="Paste JSON configuration here..."
                    value={configPaste}
                    onChange={(e) => setConfigPaste(e.target.value)}
                  />
                  <button 
                    className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-lg py-3 px-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(102,126,234,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_12px_rgba(102,126,234,0.35)] active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onApplyPastedConfig}
                    disabled={!configPaste.trim()}
                  >
                    <FaCheck /> Apply Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {toast.type && (
        <div className={`fixed bottom-[30px] right-[30px] bg-white px-5 py-4 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex items-center gap-3 text-sm font-medium animate-[slideIn_0.3s_ease-out] z-[1000] max-w-[400px] max-md:bottom-5 max-md:right-5 max-md:left-5 max-md:max-w-none ${toast.type === 'success' ? 'border-l-4 border-l-[#28a745] text-[#155724]' : 'border-l-4 border-l-[#dc3545] text-[#721c24]'}`}>
          {toast.type === 'success' ? <FaCheck className="text-[#28a745] text-lg" /> : <FaTimes className="text-[#dc3545] text-lg" />}
          <span>{toast.message}</span>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-br from-[#24292e] to-[#1a1e22] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-[100]">
        <a 
          href="https://github.com/kamal94/qr-code-generator" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white p-1.5 no-underline flex items-center justify-center gap-2.5 transition-all duration-300 font-medium text-[15px] hover:bg-white/10"
        >
          <FaGithub className="text-[22px]" /> View on GitHub
        </a>
      </div>
    </>
  );
};

export default App;