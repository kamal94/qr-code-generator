import React, { useState, useEffect, useRef } from 'react';
import { FaGithub, FaDownload, FaCheck, FaTimes } from 'react-icons/fa';
import QRCodeStyling from 'qr-code-styling';
import { createQRCanvas, downloadCanvas } from './qrCanvas';
import { ConfigurationManager } from './ConfigurationManager';


const App: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [bgColor, setBgColor] = useState('#f0f8ff');
  const [dotColor, setDotColor] = useState('#1a2a45');
  const [dotStyle, setDotStyle] = useState<'square' | 'dots' | 'rounded'>('rounded');
  const [cornerSquareStyle, setCornerSquareStyle] = useState<'square' | 'extra-rounded' | 'dot'>('extra-rounded');
  const [cornerDotStyle, setCornerDotStyle] = useState<'square' | 'dot'>('dot');
  const [centerImage, setCenterImage] = useState<string | null>(null);
  const [qrMargin, setQrMargin] = useState(13);
  const [backgroundBorderStyle, setBackgroundBorderStyle] = useState('rounded');
  const [borderRadius, setBorderRadius] = useState(50);
  const [borderWidth, setBorderWidth] = useState(13);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeContainerRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (typeof cfg.backgroundBorderStyle === 'string') setBackgroundBorderStyle(cfg.backgroundBorderStyle);
    if (Number.isFinite(cfg.borderRadius)) setBorderRadius(Math.max(0, Math.min(50, Number(cfg.borderRadius))));
    if (Number.isFinite(cfg.borderWidth)) setBorderWidth(Math.max(0, Math.min(20, Number(cfg.borderWidth))));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
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
    backgroundBorderStyle,
    borderRadius,
    borderWidth,
  });


  const onDownloadClick = async () => {
    const downloadSize = 2048;
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
        <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col items-center w-full max-w-[400px] overflow-hidden relative">
          <div className="p-[30px] flex flex-col items-center gap-5 w-full flex-1 justify-center">
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
            <button className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white border-none rounded-lg py-3.5 px-5 text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out w-full flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(79,172,254,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(79,172,254,0.4)] active:translate-y-0" onClick={onDownloadClick}>
              <FaDownload /> Download QR Code
            </button>
          </div>
          
          <ConfigurationManager
            getConfigObject={getConfigObject}
            applyConfig={applyConfig}
            showToast={showToast}
          />
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