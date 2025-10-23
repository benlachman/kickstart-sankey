import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SankeyCanvas, SankeyData } from '../components-src/SankeyCanvas';

// Sample data for demonstration
const sampleData: SankeyData = {
  nodes: [
    { id: 'coal', label: 'Coal', color: '#333333' },
    { id: 'gas', label: 'Natural Gas', color: '#4682b4' },
    { id: 'nuclear', label: 'Nuclear', color: '#ff6b6b' },
    { id: 'solar', label: 'Solar', color: '#ffd93d' },
    { id: 'wind', label: 'Wind', color: '#6bcf7f' },
    { id: 'electricity', label: 'Electricity', color: '#95a5a6' },
    { id: 'residential', label: 'Residential', color: '#e67e22' },
    { id: 'commercial', label: 'Commercial', color: '#3498db' },
    { id: 'industrial', label: 'Industrial', color: '#9b59b6' },
  ],
  links: [
    { source: 'coal', target: 'electricity', value: 30, color: 'rgba(51, 51, 51, 0.4)' },
    { source: 'gas', target: 'electricity', value: 25, color: 'rgba(70, 130, 180, 0.4)' },
    { source: 'nuclear', target: 'electricity', value: 20, color: 'rgba(255, 107, 107, 0.4)' },
    { source: 'solar', target: 'electricity', value: 15, color: 'rgba(255, 217, 61, 0.4)' },
    { source: 'wind', target: 'electricity', value: 10, color: 'rgba(107, 207, 127, 0.4)' },
    { source: 'electricity', target: 'residential', value: 35, color: 'rgba(149, 165, 166, 0.4)' },
    { source: 'electricity', target: 'commercial', value: 30, color: 'rgba(149, 165, 166, 0.4)' },
    { source: 'electricity', target: 'industrial', value: 35, color: 'rgba(149, 165, 166, 0.4)' },
  ],
};

const App: React.FC = () => {
  const [clickedNode, setClickedNode] = React.useState<string | null>(null);
  const [clickedLink, setClickedLink] = React.useState<string | null>(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Kickstart Sankey Diagram</h1>
      <p>
        A high-performance Sankey diagram built with React 16 + TypeScript using Canvas.
        Features include cubic Bézier curves, accurate hit testing, label culling, and hover labels.
      </p>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h2>Energy Flow Example</h2>
        <div style={{ border: '1px solid #ddd', display: 'inline-block' }}>
          <SankeyCanvas
            data={sampleData}
            width={900}
            height={500}
            nodeWidth={15}
            nodePadding={10}
            labelFontSize={12}
            labelMinWidth={50}
            onNodeClick={(node) => {
              setClickedNode(node.label);
              setClickedLink(null);
              console.log('Node clicked:', node);
            }}
            onLinkClick={(link) => {
              setClickedLink(`${link.source} → ${link.target}: ${link.value}`);
              setClickedNode(null);
              console.log('Link clicked:', link);
            }}
          />
        </div>
      </div>

      {clickedNode && (
        <div style={{ padding: '10px', backgroundColor: '#e8f5e9', marginTop: '10px' }}>
          <strong>Node clicked:</strong> {clickedNode}
        </div>
      )}

      {clickedLink && (
        <div style={{ padding: '10px', backgroundColor: '#e3f2fd', marginTop: '10px' }}>
          <strong>Link clicked:</strong> {clickedLink}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Features</h2>
        <ul>
          <li><strong>Cubic Bézier Curves:</strong> Smooth flow visualization with proper node alignment</li>
          <li><strong>Accurate Hit Testing:</strong> Click and hover detection using Canvas Path2D API</li>
          <li><strong>Label Culling:</strong> Automatically hide labels for small flows</li>
          <li><strong>Hover Labels:</strong> Show value labels when hovering over links</li>
          <li><strong>High Performance:</strong> Canvas-based rendering for optimal performance</li>
          <li><strong>Interactive:</strong> Click on nodes and links to trigger custom actions</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Usage</h2>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`import { SankeyCanvas, SankeyData } from './components-src/SankeyCanvas';

const data: SankeyData = {
  nodes: [
    { id: 'a', label: 'Node A', color: '#ff6b6b' },
    { id: 'b', label: 'Node B', color: '#4ecdc4' },
  ],
  links: [
    { source: 'a', target: 'b', value: 100, color: 'rgba(255, 107, 107, 0.4)' }
  ],
};

<SankeyCanvas
  data={data}
  width={800}
  height={600}
  onNodeClick={(node) => console.log('Node:', node)}
  onLinkClick={(link) => console.log('Link:', link)}
/>`}
        </pre>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
