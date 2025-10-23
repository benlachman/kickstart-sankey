require('@testing-library/jest-dom');

// Mock Path2D for JSDOM environment
global.Path2D = class Path2D {
  constructor() {
    this.commands = [];
  }
  
  moveTo(x, y) {
    this.commands.push({ type: 'moveTo', x, y });
  }
  
  lineTo(x, y) {
    this.commands.push({ type: 'lineTo', x, y });
  }
  
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.commands.push({ type: 'bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y });
  }
  
  closePath() {
    this.commands.push({ type: 'closePath' });
  }
};
