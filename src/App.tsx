import React, { useState, useEffect, useRef } from 'react';
import { FaGithub } from 'react-icons/fa';
import QRCodeStyling from 'qr-code-styling';
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
  }, []);

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
  };

  const onDownloadClick = () => {
    const tempQrCode = new QRCodeStyling({
      ...qrCode.current?._options,
      width: downloadSize,
      height: downloadSize,
      margin: 0, // We handle the margin via padding on the canvas
    });

    tempQrCode.getRawData('png').then((rawData) => {
      if (!rawData) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const padding = (qrMargin / 300) * downloadSize; // Scale padding proportionally
        const totalSize = downloadSize + padding * 2;
        canvas.width = totalSize;
        canvas.height = totalSize;

        // Draw background color and border
        ctx.fillStyle = bgColor;
        if (backgroundBorderStyle === 'rounded') {
          const radius = (borderRadius / 300) * downloadSize; // Scale radius proportionally
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(totalSize - radius, 0);
          ctx.quadraticCurveTo(totalSize, 0, totalSize, radius);
          ctx.lineTo(totalSize, totalSize - radius);
          ctx.quadraticCurveTo(totalSize, totalSize, totalSize - radius, totalSize);
          ctx.lineTo(radius, totalSize);
          ctx.quadraticCurveTo(0, totalSize, 0, totalSize - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, totalSize, totalSize);
        }

        if (borderWidth > 0) {
          const scaledBorderWidth = (borderWidth / 300) * downloadSize;
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = scaledBorderWidth;
          if (backgroundBorderStyle === 'rounded') {
            const radius = (borderRadius / 300) * downloadSize;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(totalSize - radius, 0);
            ctx.quadraticCurveTo(totalSize, 0, totalSize, radius);
            ctx.lineTo(totalSize, totalSize - radius);
            ctx.quadraticCurveTo(totalSize, totalSize, totalSize - radius, totalSize);
            ctx.lineTo(radius, totalSize);
            ctx.quadraticCurveTo(0, totalSize, 0, totalSize - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.stroke();
          } else {
            ctx.strokeRect(0, 0, totalSize, totalSize);
          }
        }

        // Draw the QR code image onto the canvas
        ctx.drawImage(img, padding, padding, downloadSize, downloadSize);

        // Trigger download
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
            Download QR Code
          </button>
        </div>
      </div>
            <div className="github-link">
        <a href="https://github.com/kamal94/qr-code-generator" target="_blank" rel="noopener noreferrer">
          <FaGithub /> View on GitHub
        </a>
      </div>
    </>
  );
};

export default App;