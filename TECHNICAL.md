# SankeyCanvas Component - Technical Documentation

## Overview

The SankeyCanvas component is a high-performance Sankey diagram visualization built with React 16, TypeScript, and HTML5 Canvas. It provides smooth, interactive flow diagrams with advanced features like accurate hit testing and smart label management.

## Key Features

### 1. Cubic Bézier Curves
- Flows are rendered using cubic Bézier curves for smooth, visually appealing transitions
- Control points are calculated to ensure proper alignment between source and target nodes
- Curves use a configurable curvature factor (default: 0.5) for optimal aesthetics

### 2. Accurate Hit Testing
- Uses Canvas `Path2D` objects for precise geometric hit detection
- Supports both node and link interaction
- `isPointInPath()` method ensures accurate click and hover detection even with overlapping flows

### 3. Label Culling
- Automatically hides labels for nodes below a configurable height threshold
- Prevents visual clutter in diagrams with many small flows
- Configurable via `labelMinWidth` prop (default: 50px)

### 4. Hover Labels
- Interactive tooltips appear when hovering over links
- Shows exact flow values without permanent label clutter
- Styled with semi-transparent background for visibility

### 5. Performance Optimizations
- Canvas-based rendering for optimal performance
- Efficient layout algorithm using breadth-first traversal
- Single render pass for all elements
- Minimal re-renders on prop changes

## Architecture

### Layout Algorithm

The component uses a column-based layout algorithm:

1. **Node Grouping**: Assigns nodes to columns using breadth-first traversal
2. **Position Calculation**: 
   - X positions based on column index
   - Y positions scaled by node values
   - Padding applied between nodes
3. **Link Routing**: Calculates flow paths with proper source/target offsets

### Rendering Pipeline

1. Clear canvas
2. Draw all links (background layer)
3. Draw all nodes (foreground layer)
4. Draw labels with culling
5. Draw hover labels if applicable

### Event Handling

- **Mouse Move**: Updates hover state and cursor
- **Mouse Click**: Triggers callbacks for nodes/links
- **Mouse Leave**: Resets hover state

## API Reference

### Props

```typescript
interface SankeyCanvasProps {
  data: SankeyData;              // Required: diagram data
  width?: number;                // Canvas width (default: 800)
  height?: number;               // Canvas height (default: 600)
  nodeWidth?: number;            // Node rectangle width (default: 15)
  nodePadding?: number;          // Vertical padding between nodes (default: 8)
  labelFontSize?: number;        // Label font size (default: 12)
  labelMinWidth?: number;        // Min height to show label (default: 50)
  onNodeClick?: (node) => void;  // Node click handler
  onLinkClick?: (link) => void;  // Link click handler
}
```

### Data Structure

```typescript
interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyNode {
  id: string;        // Unique identifier
  label: string;     // Display label
  color?: string;    // Node color (optional)
}

interface SankeyLink {
  source: string;    // Source node ID
  target: string;    // Target node ID
  value: number;     // Flow magnitude
  color?: string;    // Link color (optional)
}
```

## Usage Examples

### Basic Usage

```tsx
import { SankeyCanvas } from './components-src/SankeyCanvas';

const data = {
  nodes: [
    { id: 'a', label: 'Source' },
    { id: 'b', label: 'Target' }
  ],
  links: [
    { source: 'a', target: 'b', value: 100 }
  ]
};

<SankeyCanvas data={data} />
```

### Advanced Usage with Callbacks

```tsx
<SankeyCanvas
  data={data}
  width={1000}
  height={700}
  nodeWidth={20}
  nodePadding={12}
  onNodeClick={(node) => {
    console.log('Clicked node:', node.label);
  }}
  onLinkClick={(link) => {
    console.log(`Flow: ${link.source} → ${link.target}: ${link.value}`);
  }}
/>
```

### Custom Styling

```tsx
const styledData = {
  nodes: [
    { id: 'a', label: 'Energy', color: '#ff6b6b' },
    { id: 'b', label: 'Usage', color: '#4ecdc4' }
  ],
  links: [
    { 
      source: 'a', 
      target: 'b', 
      value: 100, 
      color: 'rgba(255, 107, 107, 0.5)' 
    }
  ]
};

<SankeyCanvas data={styledData} />
```

## Testing

The component includes comprehensive tests covering:

- ✅ Rendering with various configurations
- ✅ Data updates and re-renders
- ✅ Event handling (click, hover, leave)
- ✅ Edge cases (empty data, disconnected nodes, cycles)
- ✅ Custom colors and dimensions
- ✅ Label culling behavior

Run tests with:
```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

## Browser Compatibility

- Modern browsers with Canvas support
- Requires Path2D API support
- React 16.x compatible
- TypeScript 4.x compatible

## Performance Characteristics

- **Rendering**: O(n + m) where n = nodes, m = links
- **Layout**: O(n + m) for breadth-first traversal
- **Hit Testing**: O(1) for nodes, O(m) for links
- **Memory**: Linear with diagram size

## Best Practices

1. **Data Size**: Optimized for diagrams with up to 100 nodes and 200 links
2. **Colors**: Use semi-transparent colors for links (alpha: 0.3-0.5)
3. **Dimensions**: Ensure adequate height for node count (50px per node minimum)
4. **Labels**: Set appropriate `labelMinWidth` to prevent crowding
5. **Callbacks**: Keep click handlers lightweight to maintain responsiveness

## Troubleshooting

### Issue: Labels overlap
**Solution**: Increase `height` or `nodePadding` props

### Issue: Flows look disconnected
**Solution**: Ensure link source/target IDs match node IDs exactly

### Issue: Poor performance
**Solution**: Reduce number of nodes/links or simplify data structure

### Issue: Hover not working
**Solution**: Verify browser supports Path2D API

## Future Enhancements

Potential improvements for future versions:

- [ ] Vertical orientation support
- [ ] Drag-and-drop node repositioning
- [ ] Animated transitions
- [ ] Zoom and pan controls
- [ ] Export to SVG/PNG
- [ ] Custom node shapes
- [ ] Multi-level hierarchies
- [ ] Dynamic data updates with transitions

## License

ISC License - See LICENSE file for details
