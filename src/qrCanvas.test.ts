import {
  calculatePadding,
  calculateTotalSize,
  calculateScaledBorderRadius,
  calculateScaledBorderWidth,
  drawRoundedRectPath,
  drawBackground,
  drawBorder,
  drawQRCode,
  drawCompleteCanvas,
  CanvasDrawingParams,
} from './qrCanvas';

describe('qrCanvas calculation functions', () => {
  describe('calculatePadding', () => {
    it('should calculate padding correctly for typical values', () => {
      expect(calculatePadding(20, 1000)).toBeCloseTo(66.67, 1);
      expect(calculatePadding(10, 1000)).toBeCloseTo(33.33, 1);
      expect(calculatePadding(30, 2048)).toBeCloseTo(204.8, 1);
    });

    it('should handle zero margin', () => {
      expect(calculatePadding(0, 1000)).toBe(0);
      expect(calculatePadding(0, 2048)).toBe(0);
    });

    it('should handle maximum margin (50)', () => {
      expect(calculatePadding(50, 1000)).toBeCloseTo(166.67, 1);
      expect(calculatePadding(50, 2048)).toBeCloseTo(341.33, 1);
    });

    it('should scale proportionally with download size', () => {
      const margin = 20;
      const padding1000 = calculatePadding(margin, 1000);
      const padding2000 = calculatePadding(margin, 2000);
      expect(padding2000).toBeCloseTo(padding1000 * 2, 1);
    });

    it('should handle very small margins', () => {
      expect(calculatePadding(1, 1000)).toBeCloseTo(3.33, 1);
      expect(calculatePadding(0.5, 1000)).toBeCloseTo(1.67, 1);
    });

    it('should handle very large download sizes', () => {
      expect(calculatePadding(20, 5000)).toBeCloseTo(333.33, 1);
      expect(calculatePadding(20, 10000)).toBeCloseTo(666.67, 1);
    });
  });

  describe('calculateTotalSize', () => {
    it('should calculate total size correctly', () => {
      expect(calculateTotalSize(1000, 100, 0)).toBe(1200);
      expect(calculateTotalSize(2048, 204.8, 0)).toBeCloseTo(2457.6, 1);
    });

    it('should handle zero padding', () => {
      expect(calculateTotalSize(1000, 0, 0)).toBe(1000);
      expect(calculateTotalSize(2048, 0, 0)).toBe(2048);
    });

    it('should handle very small padding', () => {
      expect(calculateTotalSize(1000, 0.5, 0)).toBe(1001);
      expect(calculateTotalSize(1000, 1, 0)).toBe(1002);
    });

    it('should handle very large padding', () => {
      expect(calculateTotalSize(1000, 500, 0)).toBe(2000);
      expect(calculateTotalSize(1000, 1000, 0)).toBe(3000);
    });

    it('should correctly add padding on both sides and border width', () => {
      const downloadSize = 1000;
      const padding = 50;
      const borderWidth = 20;
      const totalSize = calculateTotalSize(downloadSize, padding, borderWidth);
      expect(totalSize - downloadSize).toBe(padding * 2 + borderWidth);
    });

    it('should account for border width in total size', () => {
      expect(calculateTotalSize(1000, 100, 20)).toBe(1220);
      expect(calculateTotalSize(2048, 204.8, 50)).toBeCloseTo(2507.6, 1);
    });
  });

  describe('calculateScaledBorderRadius', () => {
    it('should calculate scaled border radius correctly', () => {
      expect(calculateScaledBorderRadius(20, 1000)).toBeCloseTo(66.67, 1);
      expect(calculateScaledBorderRadius(30, 1500)).toBeCloseTo(150, 1);
    });

    it('should handle zero border radius', () => {
      expect(calculateScaledBorderRadius(0, 1000)).toBe(0);
      expect(calculateScaledBorderRadius(0, 2048)).toBe(0);
    });

    it('should handle maximum border radius (50)', () => {
      expect(calculateScaledBorderRadius(50, 1000)).toBeCloseTo(166.67, 1);
      expect(calculateScaledBorderRadius(50, 2048)).toBeCloseTo(341.33, 1);
    });

    it('should scale proportionally with download size', () => {
      const radius = 20;
      const scaled1000 = calculateScaledBorderRadius(radius, 1000);
      const scaled2000 = calculateScaledBorderRadius(radius, 2000);
      expect(scaled2000).toBeCloseTo(scaled1000 * 2, 1);
    });
  });

  describe('calculateScaledBorderWidth', () => {
    it('should calculate scaled border width correctly', () => {
      expect(calculateScaledBorderWidth(5, 1000)).toBeCloseTo(16.67, 1);
      expect(calculateScaledBorderWidth(10, 1500)).toBeCloseTo(50, 1);
    });

    it('should handle zero border width', () => {
      expect(calculateScaledBorderWidth(0, 1000)).toBe(0);
      expect(calculateScaledBorderWidth(0, 2048)).toBe(0);
    });

    it('should handle very small border width', () => {
      expect(calculateScaledBorderWidth(1, 1000)).toBeCloseTo(3.33, 1);
      expect(calculateScaledBorderWidth(0.5, 1000)).toBeCloseTo(1.67, 1);
    });

    it('should handle maximum border width (20)', () => {
      expect(calculateScaledBorderWidth(20, 1000)).toBeCloseTo(66.67, 1);
      expect(calculateScaledBorderWidth(20, 2048)).toBeCloseTo(136.53, 1);
    });

    it('should scale proportionally with download size', () => {
      const width = 10;
      const scaled1000 = calculateScaledBorderWidth(width, 1000);
      const scaled2000 = calculateScaledBorderWidth(width, 2000);
      expect(scaled2000).toBeCloseTo(scaled1000 * 2, 1);
    });
  });
});

describe('qrCanvas drawing functions', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: any;
  let mockImg: HTMLImageElement;

  const createMockContext = () => {
    const ctx: any = {
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      stroke: jest.fn(),
      strokeRect: jest.fn(),
      drawImage: jest.fn(),
    };
    
    // Create getter/setter for properties
    let fillStyleValue = '';
    let strokeStyleValue = '';
    let lineWidthValue = 0;
    
    Object.defineProperty(ctx, 'fillStyle', {
      get: () => fillStyleValue,
      set: (val) => { fillStyleValue = val; },
      enumerable: true,
      configurable: true,
    });
    
    Object.defineProperty(ctx, 'strokeStyle', {
      get: () => strokeStyleValue,
      set: (val) => { strokeStyleValue = val; },
      enumerable: true,
      configurable: true,
    });
    
    Object.defineProperty(ctx, 'lineWidth', {
      get: () => lineWidthValue,
      set: (val) => { lineWidthValue = val; },
      enumerable: true,
      configurable: true,
    });
    
    return ctx;
  };

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockCtx = createMockContext();
    mockImg = new Image();
  });

  describe('drawRoundedRectPath', () => {
    it('should create a rounded rectangle path with correct corner curves', () => {
      const totalSize = 1000;
      const radius = 50;
      
      drawRoundedRectPath(mockCtx, totalSize, radius);

      expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
      expect(mockCtx.moveTo).toHaveBeenCalledWith(radius, 0);
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalledTimes(4);
      expect(mockCtx.closePath).toHaveBeenCalledTimes(1);
    });

    it('should handle zero radius (sharp corners)', () => {
      drawRoundedRectPath(mockCtx, 1000, 0);

      expect(mockCtx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
    });

    it('should handle very small radius', () => {
      const radius = 1;
      drawRoundedRectPath(mockCtx, 1000, radius);

      expect(mockCtx.moveTo).toHaveBeenCalledWith(radius, 0);
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalledTimes(4);
    });

    it('should handle large radius relative to size', () => {
      const totalSize = 100;
      const radius = 50; // 50% of size
      
      drawRoundedRectPath(mockCtx, totalSize, radius);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalledTimes(4);
    });
  });

  describe('drawBackground', () => {
    const getBaseParams = (): CanvasDrawingParams => ({
      canvas: mockCanvas,
      ctx: mockCtx,
      img: mockImg,
      bgColor: '#ffffff',
      dotColor: '#000000',
      downloadSize: 1000,
      padding: 50,
      totalSize: 1100,
      borderRadius: 20,
      borderWidth: 5,
      backgroundBorderStyle: 'square',
    });

    it('should draw square background correctly', () => {
      drawBackground(getBaseParams());

      expect(mockCtx.fillStyle).toBe('#ffffff');
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1100, 1100);
      expect(mockCtx.fill).not.toHaveBeenCalled();
    });

    it('should draw rounded background correctly', () => {
      const params = { ...getBaseParams(), backgroundBorderStyle: 'rounded' as const };
      drawBackground(params);

      expect(mockCtx.fillStyle).toBe('#ffffff');
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('should handle edge case: zero padding with square background', () => {
      const params = { ...getBaseParams(), padding: 0, totalSize: 1000 };
      drawBackground(params);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 1000);
    });

    it('should handle edge case: zero padding with rounded background', () => {
      const params = {
        ...getBaseParams(),
        padding: 0,
        totalSize: 1000,
        backgroundBorderStyle: 'rounded' as const,
      };
      drawBackground(params);

      expect(mockCtx.fill).toHaveBeenCalled();
    });
  });

  describe('drawBorder', () => {
    const getBaseParams = (): CanvasDrawingParams => ({
      canvas: mockCanvas,
      ctx: mockCtx,
      img: mockImg,
      bgColor: '#ffffff',
      dotColor: '#000000',
      downloadSize: 1000,
      padding: 50,
      totalSize: 1100,
      borderRadius: 20,
      borderWidth: 5,
      backgroundBorderStyle: 'square',
    });

    it('should draw square border correctly', () => {
      drawBorder(getBaseParams());

      expect(mockCtx.strokeStyle).toBe('#000000');
      expect(mockCtx.lineWidth).toBeCloseTo(16.67, 1);
      // Border should be inset by half its width
      const halfBorderWidth = 16.67 / 2;
      expect(mockCtx.strokeRect).toHaveBeenCalledWith(
        halfBorderWidth,
        halfBorderWidth,
        1100 - 16.67,
        1100 - 16.67
      );
    });

    it('should draw rounded border correctly', () => {
      const params = { ...getBaseParams(), backgroundBorderStyle: 'rounded' as const };
      drawBorder(params);

      expect(mockCtx.strokeStyle).toBe('#000000');
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should not draw border when borderWidth is 0', () => {
      const params = { ...getBaseParams(), borderWidth: 0 };
      drawBorder(params);

      expect(mockCtx.stroke).not.toHaveBeenCalled();
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
    });

    it('should not draw border when borderWidth is negative', () => {
      const params = { ...getBaseParams(), borderWidth: -5 };
      drawBorder(params);

      expect(mockCtx.stroke).not.toHaveBeenCalled();
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
    });

    it('should handle very small border width', () => {
      const params = { ...getBaseParams(), borderWidth: 0.5 };
      drawBorder(params);

      expect(mockCtx.lineWidth).toBeCloseTo(1.67, 1);
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('should handle maximum border width (20)', () => {
      const params = { ...getBaseParams(), borderWidth: 20 };
      drawBorder(params);

      expect(mockCtx.lineWidth).toBeCloseTo(66.67, 1);
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('should scale border width with download size', () => {
      const params1 = { ...getBaseParams(), downloadSize: 1000, borderWidth: 10 };
      const params2 = { ...getBaseParams(), downloadSize: 2000, borderWidth: 10 };

      drawBorder(params1);
      const width1 = mockCtx.lineWidth;

      jest.clearAllMocks();

      drawBorder(params2);
      const width2 = mockCtx.lineWidth;

      expect(width2).toBeCloseTo(width1 * 2, 1);
    });
  });

  describe('drawQRCode', () => {
    const getBaseParams = (): CanvasDrawingParams => ({
      canvas: mockCanvas,
      ctx: mockCtx,
      img: mockImg,
      bgColor: '#ffffff',
      dotColor: '#000000',
      downloadSize: 1000,
      padding: 50,
      totalSize: 1100,
      borderRadius: 20,
      borderWidth: 5,
      backgroundBorderStyle: 'square',
    });

    it('should draw QR code at correct position with padding and border', () => {
      drawQRCode(getBaseParams());

      // scaledBorderWidth = (5 / 300) * 1000 = 16.67
      // offset = 16.67/2 + 50 = 58.335
      const scaledBorderWidth = (5 / 300) * 1000;
      const expectedOffset = scaledBorderWidth / 2 + 50;
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImg,
        expectedOffset,
        expectedOffset,
        1000,
        1000
      );
    });

    it('should draw QR code with only border offset when padding is 0', () => {
      const params = { ...getBaseParams(), padding: 0 };
      drawQRCode(params);

      // scaledBorderWidth = (5 / 300) * 1000 = 16.67
      // offset = 16.67/2 + 0 = 8.335
      const scaledBorderWidth = (5 / 300) * 1000;
      const expectedOffset = scaledBorderWidth / 2;
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImg,
        expectedOffset,
        expectedOffset,
        1000,
        1000
      );
    });

    it('should handle very large padding', () => {
      const params = { ...getBaseParams(), padding: 500 };
      drawQRCode(params);

      // scaledBorderWidth = (5 / 300) * 1000 = 16.67
      // offset = 16.67/2 + 500 = 508.335
      const scaledBorderWidth = (5 / 300) * 1000;
      const expectedOffset = scaledBorderWidth / 2 + 500;
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImg,
        expectedOffset,
        expectedOffset,
        1000,
        1000
      );
    });

    it('should handle different download sizes', () => {
      const params = { ...getBaseParams(), downloadSize: 2048 };
      drawQRCode(params);

      // scaledBorderWidth = (5 / 300) * 2048 = 34.13
      // offset = 34.13/2 + 50 = 67.065
      const scaledBorderWidth = (5 / 300) * 2048;
      const expectedOffset = scaledBorderWidth / 2 + 50;
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImg,
        expectedOffset,
        expectedOffset,
        2048,
        2048
      );
    });
  });

  describe('drawCompleteCanvas', () => {
    const getBaseParams = (): CanvasDrawingParams => ({
      canvas: mockCanvas,
      ctx: mockCtx,
      img: mockImg,
      bgColor: '#ffffff',
      dotColor: '#000000',
      downloadSize: 1000,
      padding: 50,
      totalSize: 1100,
      borderRadius: 20,
      borderWidth: 5,
      backgroundBorderStyle: 'square',
    });

    it('should call all drawing functions in correct order', () => {
      drawCompleteCanvas(getBaseParams());

      // Background should be drawn first
      expect(mockCtx.fillRect).toHaveBeenCalled();
      
      // Border should be drawn second
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      
      // QR code should be drawn last
      expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    it('should work with zero border width', () => {
      const params = { ...getBaseParams(), borderWidth: 0 };
      drawCompleteCanvas(params);

      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
      expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    it('should work with zero padding', () => {
      const params = { ...getBaseParams(), padding: 0, totalSize: 1000 };
      drawCompleteCanvas(params);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 1000);
      // QR code still offset by half border width
      const scaledBorderWidth = (5 / 300) * 1000;
      const expectedOffset = scaledBorderWidth / 2;
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImg,
        expectedOffset,
        expectedOffset,
        1000,
        1000
      );
    });
  });
});

describe('Edge case combinations', () => {
  describe('Border and Padding interactions', () => {
    it('should handle zero border with zero padding', () => {
      const padding = calculatePadding(0, 1000);
      const borderWidth = calculateScaledBorderWidth(0, 1000);
      const totalSize = calculateTotalSize(1000, padding, borderWidth);

      expect(padding).toBe(0);
      expect(totalSize).toBe(1000);
      expect(borderWidth).toBe(0);
    });

    it('should handle maximum border with maximum padding', () => {
      const padding = calculatePadding(50, 1000);
      const borderWidth = calculateScaledBorderWidth(20, 1000);
      const totalSize = calculateTotalSize(1000, padding, borderWidth);

      expect(padding).toBeCloseTo(166.67, 1);
      expect(totalSize).toBeCloseTo(1400, 1); // 1000 + 166.67*2 + 66.67
      expect(borderWidth).toBeCloseTo(66.67, 1);
    });

    it('should handle very small border with very small padding', () => {
      const padding = calculatePadding(1, 1000);
      const borderWidth = calculateScaledBorderWidth(1, 1000);
      const totalSize = calculateTotalSize(1000, padding, borderWidth);

      expect(padding).toBeCloseTo(3.33, 1);
      expect(totalSize).toBeCloseTo(1010, 1); // 1000 + 3.33*2 + 3.33
      expect(borderWidth).toBeCloseTo(3.33, 1);
    });

    it('should handle large border with small padding', () => {
      const padding = calculatePadding(5, 1000);
      const borderWidth = calculateScaledBorderWidth(20, 1000);
      const totalSize = calculateTotalSize(1000, padding, borderWidth);

      expect(padding).toBeCloseTo(16.67, 1);
      expect(totalSize).toBeCloseTo(1100, 1); // 1000 + 16.67*2 + 66.67
      expect(borderWidth).toBeCloseTo(66.67, 1);
    });

    it('should handle small border with large padding', () => {
      const padding = calculatePadding(50, 1000);
      const borderWidth = calculateScaledBorderWidth(1, 1000);
      const totalSize = calculateTotalSize(1000, padding, borderWidth);

      expect(padding).toBeCloseTo(166.67, 1);
      expect(totalSize).toBeCloseTo(1336.67, 1); // 1000 + 166.67*2 + 3.33
      expect(borderWidth).toBeCloseTo(3.33, 1);
    });
  });

  describe('Extreme download sizes', () => {
    it('should handle very small download size (512)', () => {
      const padding = calculatePadding(20, 512);
      const borderWidth = calculateScaledBorderWidth(10, 512);
      const totalSize = calculateTotalSize(512, padding, borderWidth);

      expect(padding).toBeCloseTo(34.13, 1);
      expect(totalSize).toBeCloseTo(597.33, 1); // 512 + 34.13*2 + 17.07
      expect(borderWidth).toBeCloseTo(17.07, 1);
    });

    it('should handle large download size (2048)', () => {
      const padding = calculatePadding(20, 2048);
      const borderWidth = calculateScaledBorderWidth(10, 2048);
      const totalSize = calculateTotalSize(2048, padding, borderWidth);

      expect(padding).toBeCloseTo(136.53, 1);
      expect(totalSize).toBeCloseTo(2389.33, 1); // 2048 + 136.53*2 + 68.27
      expect(borderWidth).toBeCloseTo(68.27, 1);
    });

    it('should maintain proportions across different sizes', () => {
      const margin = 20;
      const borderW = 10;

      const padding512 = calculatePadding(margin, 512);
      const padding1024 = calculatePadding(margin, 1024);
      const padding2048 = calculatePadding(margin, 2048);

      const border512 = calculateScaledBorderWidth(borderW, 512);
      const border1024 = calculateScaledBorderWidth(borderW, 1024);
      const border2048 = calculateScaledBorderWidth(borderW, 2048);

      expect(padding1024 / padding512).toBeCloseTo(2, 1);
      expect(padding2048 / padding1024).toBeCloseTo(2, 1);
      expect(border1024 / border512).toBeCloseTo(2, 1);
      expect(border2048 / border1024).toBeCloseTo(2, 1);
    });
  });
});
