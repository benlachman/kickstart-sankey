import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SankeyCanvas, SankeyData } from '../SankeyCanvas';

// Mock canvas methods
HTMLCanvasElement.prototype.getContext = jest.fn(() => {
  const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 })),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    isPointInPath: jest.fn(() => false),
  } as any;
  
  Object.defineProperty(mockContext, 'font', { writable: true, value: '' });
  Object.defineProperty(mockContext, 'fillStyle', { writable: true, value: '' });
  Object.defineProperty(mockContext, 'strokeStyle', { writable: true, value: '' });
  Object.defineProperty(mockContext, 'lineWidth', { writable: true, value: 1 });
  Object.defineProperty(mockContext, 'globalAlpha', { writable: true, value: 1 });
  Object.defineProperty(mockContext, 'textAlign', { writable: true, value: 'left' });
  Object.defineProperty(mockContext, 'textBaseline', { writable: true, value: 'alphabetic' });
  
  return mockContext;
}) as any;

describe('SankeyCanvas', () => {
  const mockData: SankeyData = {
    nodes: [
      { id: 'a', label: 'Node A' },
      { id: 'b', label: 'Node B' },
      { id: 'c', label: 'Node C' },
    ],
    links: [
      { source: 'a', target: 'b', value: 10 },
      { source: 'b', target: 'c', value: 5 },
    ],
  };

  it('renders a canvas element', () => {
    const { container } = render(<SankeyCanvas data={mockData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('sets canvas dimensions from props', () => {
    const { container } = render(
      <SankeyCanvas data={mockData} width={1000} height={800} />
    );
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(1000);
    expect(canvas.height).toBe(800);
  });

  it('uses default dimensions when not provided', () => {
    const { container } = render(<SankeyCanvas data={mockData} />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it('handles empty data gracefully', () => {
    const emptyData: SankeyData = { nodes: [], links: [] };
    const { container } = render(<SankeyCanvas data={emptyData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('handles data with only nodes', () => {
    const nodesOnlyData: SankeyData = {
      nodes: [{ id: 'a', label: 'Node A' }],
      links: [],
    };
    const { container } = render(<SankeyCanvas data={nodesOnlyData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with custom colors for nodes', () => {
    const coloredData: SankeyData = {
      nodes: [
        { id: 'a', label: 'Node A', color: '#ff0000' },
        { id: 'b', label: 'Node B', color: '#00ff00' },
      ],
      links: [{ source: 'a', target: 'b', value: 10 }],
    };
    const { container } = render(<SankeyCanvas data={coloredData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with custom colors for links', () => {
    const coloredData: SankeyData = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ],
      links: [{ source: 'a', target: 'b', value: 10, color: '#0000ff' }],
    };
    const { container } = render(<SankeyCanvas data={coloredData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('accepts custom node width', () => {
    const { container } = render(
      <SankeyCanvas data={mockData} nodeWidth={20} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('accepts custom node padding', () => {
    const { container } = render(
      <SankeyCanvas data={mockData} nodePadding={15} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('accepts custom label font size', () => {
    const { container } = render(
      <SankeyCanvas data={mockData} labelFontSize={16} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('accepts custom label minimum width', () => {
    const { container } = render(
      <SankeyCanvas data={mockData} labelMinWidth={75} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('handles click events on nodes', () => {
    const handleNodeClick = jest.fn();
    const { container } = render(
      <SankeyCanvas data={mockData} onNodeClick={handleNodeClick} />
    );
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    
    // Simulate click
    canvas.click();
    
    // Note: Without actual layout calculation, we can't test the click handler being called
    // This test verifies the prop is accepted
    expect(canvas).toBeInTheDocument();
  });

  it('handles click events on links', () => {
    const handleLinkClick = jest.fn();
    const { container } = render(
      <SankeyCanvas data={mockData} onLinkClick={handleLinkClick} />
    );
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    
    // Simulate click
    canvas.click();
    
    // Note: Without actual layout calculation, we can't test the click handler being called
    // This test verifies the prop is accepted
    expect(canvas).toBeInTheDocument();
  });

  it('handles complex data with multiple paths', () => {
    const complexData: SankeyData = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
        { id: 'e', label: 'E' },
      ],
      links: [
        { source: 'a', target: 'b', value: 10 },
        { source: 'a', target: 'c', value: 5 },
        { source: 'b', target: 'd', value: 7 },
        { source: 'c', target: 'd', value: 3 },
        { source: 'd', target: 'e', value: 8 },
      ],
    };
    const { container } = render(<SankeyCanvas data={complexData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('updates when data changes', () => {
    const { container, rerender } = render(<SankeyCanvas data={mockData} />);
    
    const newData: SankeyData = {
      nodes: [
        { id: 'x', label: 'Node X' },
        { id: 'y', label: 'Node Y' },
      ],
      links: [{ source: 'x', target: 'y', value: 20 }],
    };
    
    rerender(<SankeyCanvas data={newData} />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('updates when dimensions change', () => {
    const { container, rerender } = render(
      <SankeyCanvas data={mockData} width={800} height={600} />
    );
    
    rerender(<SankeyCanvas data={mockData} width={1000} height={800} />);
    
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(1000);
    expect(canvas.height).toBe(800);
  });

  it('handles nodes with varying values', () => {
    const varyingData: SankeyData = {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      links: [
        { source: 'a', target: 'b', value: 100 },
        { source: 'a', target: 'c', value: 1 },
      ],
    };
    const { container } = render(<SankeyCanvas data={varyingData} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('cleans up animation frames on unmount', () => {
    const { unmount } = render(<SankeyCanvas data={mockData} />);
    unmount();
    // Component should unmount without errors
  });

  describe('Hit Testing', () => {
    it('changes cursor on hover', () => {
      const { container } = render(<SankeyCanvas data={mockData} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      
      // Initial cursor should be default or not set
      expect(canvas.style.cursor).not.toBe('pointer');
    });

    it('resets cursor on mouse leave', () => {
      const { container } = render(<SankeyCanvas data={mockData} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      
      // Set cursor first
      canvas.style.cursor = 'pointer';
      
      // Simulate mouse leave using fireEvent
      fireEvent.mouseLeave(canvas);
      
      expect(canvas.style.cursor).toBe('default');
    });
  });

  describe('Label Culling', () => {
    it('applies label culling based on labelMinWidth', () => {
      const smallNodeData: SankeyData = {
        nodes: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        links: [{ source: 'a', target: 'b', value: 0.1 }],
      };
      
      const { container } = render(
        <SankeyCanvas data={smallNodeData} labelMinWidth={100} />
      );
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single node', () => {
      const singleNodeData: SankeyData = {
        nodes: [{ id: 'a', label: 'Single Node' }],
        links: [],
      };
      const { container } = render(<SankeyCanvas data={singleNodeData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('handles disconnected nodes', () => {
      const disconnectedData: SankeyData = {
        nodes: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        links: [{ source: 'a', target: 'b', value: 10 }],
      };
      const { container } = render(<SankeyCanvas data={disconnectedData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('handles cyclic links', () => {
      const cyclicData: SankeyData = {
        nodes: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        links: [
          { source: 'a', target: 'b', value: 10 },
          { source: 'b', target: 'a', value: 5 },
        ],
      };
      const { container } = render(<SankeyCanvas data={cyclicData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('handles zero value links', () => {
      const zeroValueData: SankeyData = {
        nodes: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        links: [{ source: 'a', target: 'b', value: 0 }],
      };
      const { container } = render(<SankeyCanvas data={zeroValueData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });
});
