import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import './styles.css';

const App: React.FC = () => {
  const [url, setUrl] = useState('https://gemini.google.com');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotColor, setDotColor] = useState('#000000');
  const [dotStyle, setDotStyle] = useState<'square' | 'dots' | 'rounded'>('square');
  const [cornerSquareStyle, setCornerSquareStyle] = useState<'square' | 'extra-rounded' | 'dot'>('square');
  const [cornerDotStyle, setCornerDotStyle] = useState<'square' | 'dot'>('square');
  const [centerImage, setCenterImage] = useState<string | null>(null);
  const [qrMargin, setQrMargin] = useState(10);
  const [downloadSize, setDownloadSize] = useState(1000);

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCode.current = new QRCodeStyling({
        width: 300,
        height: 300,
        margin: qrMargin,
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
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: url,
        margin: qrMargin,
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
  }, [url, bgColor, dotColor, dotStyle, cornerSquareStyle, centerImage, qrMargin, cornerDotStyle]);

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

  const onDownloadClick = () => {
    if (!qrCode.current) return;

    qrCode.current.getRawData('png').then((rawData) => {
      if (!rawData) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const totalSize = downloadSize;
        canvas.width = totalSize;
        canvas.height = totalSize;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, totalSize, totalSize);

        const qrCodeSize = totalSize - qrMargin * 2;
        ctx.drawImage(img, qrMargin, qrMargin, qrCodeSize, qrCodeSize);

        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(rawData as Blob);
    });
  };

  return (
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
          <label>Center Image</label>
          <div className="file-input-wrapper">
            <div className="file-input-button">Upload Image</div>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="margin">Border Thickness</label>
          <input
            type="range"
            id="margin"
            min="0"
            max="50"
            value={qrMargin}
            onChange={(e) => setQrMargin(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <div className="qr-code-panel">
        <div id="qr-code" ref={qrCodeRef}></div>
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
          Download PNG
        </button>
      </div>
    </div>
  );
};

export default App;