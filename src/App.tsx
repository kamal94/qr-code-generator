import React, { useState, useEffect, useRef } from 'react';
import { FaGithub, FaCopy, FaDownload, FaUpload, FaFileImport, FaFileExport, FaCheck, FaTimes } from 'react-icons/fa';
import QRCodeStyling from 'qr-code-styling';
import { createQRCanvas, downloadCanvas } from './qrCanvas';
import './styles.css';

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
      <div className="container">
        <div className="settings-panel">
          <h1>QR Code Generator</h1>
          <div className="input-group">
            <label htmlFor="url">Target URL</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="color-inputs">
            <div className="input-group">
              <label htmlFor="bg-color">Background Color</label>
              <input
                type="color"
                id="bg-color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="dot-color">Dot Color</label>
              <input
                type="color"
                id="dot-color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="dot-style">Dot Shape</label>
            <select
              id="dot-style"
              value={dotStyle}
              onChange={(e) => setDotStyle(e.target.value as 'square' | 'dots' | 'rounded')}
            >
              <option value="square">Square</option>
              <option value="dots">Circle</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="corner-style">Border Corner Shape</label>
            <select
              id="corner-style"
              value={cornerSquareStyle}
              onChange={(e) => setCornerSquareStyle(e.target.value as 'square' | 'extra-rounded' | 'dot')}
            >
              <option value="square">Square</option>
              <option value="extra-rounded">Rounded</option>
              <option value="dot">Circle</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="corner-dot-style">Corner Dot Shape</label>
            <select
              id="corner-dot-style"
              value={cornerDotStyle}
              onChange={(e) => setCornerDotStyle(e.target.value as 'square' | 'dot')}
            >
              <option value="square">Square</option>
              <option value="dot">Dot</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="background-border-style">Background Border Style</label>
            <select
              id="background-border-style"
              value={backgroundBorderStyle}
              onChange={(e) => setBackgroundBorderStyle(e.target.value)}
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="border-width">Border Line Thickness</label>
            <input
              type="range"
              id="border-width"
              min="0"
              max="20"
              value={borderWidth}
              onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))}
            />
          </div>

          {backgroundBorderStyle === 'rounded' && (
            <div className="input-group">
              <label htmlFor="border-radius">Border Radius</label>
              <input
                type="range"
                id="border-radius"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
              />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="margin">Border Padding</label>
            <input
              type="range"
              id="margin"
              min="0"
              max="50"
              value={qrMargin}
              onChange={(e) => setQrMargin(parseInt(e.target.value, 10))}
            />
          </div>
          <div className="input-group">
            <label>Center Image</label>
            <div className="image-controls">
              <div className="file-input-wrapper">
                <div className="file-input-button">Upload  Center Image</div>
                <input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} />
              </div>
              {centerImage && (
                <button className="remove-image-button" onClick={onRemoveImageClick}>
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="qr-code-panel">
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
          <div className="input-group">
            <label htmlFor="download-size">Download Resolution</label>
            <select
              id="download-size"
              value={downloadSize}
              onChange={(e) => setDownloadSize(parseInt(e.target.value, 10))}
            >
              <option value="512">512x512</option>
              <option value="1024">1024x1024</option>
              <option value="2048">2048x2048</option>
            </select>
          </div>
          <button className="download-button" onClick={onDownloadClick}>
            <FaDownload /> Download QR Code
          </button>
          
          <div className="config-manager">
            <div className="config-header">
              <h3>Configuration Manager</h3>
            </div>
            <div className="config-tabs">
              <button 
                className={`config-tab ${configTab === 'export' ? 'active' : ''}`}
                onClick={() => setConfigTab('export')}
              >
                <FaFileExport /> Export
              </button>
              <button 
                className={`config-tab ${configTab === 'import' ? 'active' : ''}`}
                onClick={() => setConfigTab('import')}
              >
                <FaFileImport /> Import
              </button>
            </div>
            
            {configTab === 'export' && (
              <div className="config-content">
                <p className="config-description">Save or copy your current QR code settings</p>
                <div className="config-actions">
                  <button className="config-action-button" onClick={onCopyConfigClick}>
                    <FaCopy /> Copy to Clipboard
                  </button>
                  <button className="config-action-button" onClick={onSaveConfigClick}>
                    <FaDownload /> Download File
                  </button>
                </div>
              </div>
            )}
            
            {configTab === 'import' && (
              <div className="config-content">
                <p className="config-description">Restore settings from a saved configuration</p>
                
                <div 
                  className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => configFileInputRef.current?.click()}
                >
                  <FaUpload className="drop-zone-icon" />
                  <p className="drop-zone-text">
                    {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="drop-zone-subtext">JSON files only</p>
                  <input 
                    type="file" 
                    ref={configFileInputRef}
                    accept="application/json,.json" 
                    onChange={onConfigFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div className="divider">
                  <span>OR</span>
                </div>
                
                <div className="paste-section">
                  <textarea
                    className="config-textarea"
                    placeholder="Paste JSON configuration here..."
                    value={configPaste}
                    onChange={(e) => setConfigPaste(e.target.value)}
                  />
                  <button 
                    className="config-action-button"
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
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
          <span>{toast.message}</span>
        </div>
      )}
      
      <div className="github-link">
        <a href="https://github.com/kamal94/qr-code-generator" target="_blank" rel="noopener noreferrer">
          <FaGithub /> View on GitHub
        </a>
      </div>
    </>
  );
};

export default App;