# kickstart-sankey

A high-performance Sankey diagram built for Idyll in React 16 + TypeScript using Canvas.

[Live Demo](https://benlachman.github.io/kickstart-sankey)

## Features

- 🎨 **Cubic Bézier Curves** - Smooth flow visualization with proper node alignment
- 🎯 **Accurate Hit Testing** - Precise click and hover detection using Canvas Path2D API
- 🏷️ **Smart Label Culling** - Automatically hide labels for small flows to reduce clutter
- 💬 **Hover Labels** - Interactive value labels appear when hovering over links
- ⚡ **High Performance** - Canvas-based rendering for optimal performance with large datasets
- 🖱️ **Interactive** - Click handlers for both nodes and links
- 📦 **TypeScript** - Fully typed API for better developer experience

## Installation

```bash
npm install
```

## Usage

```tsx
import { SankeyCanvas, SankeyData } from './components-src/SankeyCanvas';

const data: SankeyData = {
  nodes: [
    { id: 'a', label: 'Node A', color: '#ff6b6b' },
    { id: 'b', label: 'Node B', color: '#4ecdc4' },
    { id: 'c', label: 'Node C', color: '#45b7d1' },
  ],
  links: [
    { source: 'a', target: 'b', value: 100, color: 'rgba(255, 107, 107, 0.4)' },
    { source: 'b', target: 'c', value: 50, color: 'rgba(76, 209, 196, 0.4)' }
  ],
};

function App() {
  return (
    <SankeyCanvas
      data={data}
      width={800}
      height={600}
      nodeWidth={15}
      nodePadding={10}
      labelFontSize={12}
      labelMinWidth={50}
      onNodeClick={(node) => console.log('Node clicked:', node)}
      onLinkClick={(link) => console.log('Link clicked:', link)}
    />
  );
}
```

## API Reference

### SankeyCanvas Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `SankeyData` | *required* | The data to visualize |
| `width` | `number` | `800` | Canvas width in pixels |
| `height` | `number` | `600` | Canvas height in pixels |
| `nodeWidth` | `number` | `15` | Width of node rectangles |
| `nodePadding` | `number` | `8` | Vertical padding between nodes |
| `labelFontSize` | `number` | `12` | Font size for node labels |
| `labelMinWidth` | `number` | `50` | Minimum node height to display label |
| `onNodeClick` | `(node: SankeyNode) => void` | - | Click handler for nodes |
| `onLinkClick` | `(link: SankeyLink) => void` | - | Click handler for links |

### SankeyData Interface

```typescript
interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

interface SankeyLink {
  source: string;  // Node ID
  target: string;  // Node ID
  value: number;
  color?: string;
}
```

## Development

### Run Development Server

```bash
npm start
```

The demo will be available at http://localhost:3000

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Technical Implementation

### Cubic Bézier Curves

Links are rendered using cubic Bézier curves with carefully calculated control points to ensure smooth, visually pleasing flows that properly align with source and target nodes.

### Hit Testing

The component uses Canvas `Path2D` objects and `isPointInPath()` for accurate hit detection, enabling precise interaction with even complex, overlapping flows.

### Label Culling

To prevent visual clutter, labels are automatically hidden for nodes that are too small (configurable via `labelMinWidth`). This keeps the diagram readable even with many small flows.

### Hover Labels

When hovering over links, a tooltip displays the flow value, making it easy to see exact values without cluttering the diagram with permanent labels.

## Browser Support

- Modern browsers with Canvas and Path2D support
- React 16.x

## License

ISC
