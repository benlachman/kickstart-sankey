import * as React from 'react';

/**
 * Represents a node in the Sankey diagram
 */
export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

/**
 * Represents a link (flow) between nodes
 */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

/**
 * Data structure for the Sankey diagram
 */
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Props for the SankeyCanvas component
 */
export interface SankeyCanvasProps {
  data: SankeyData;
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  labelFontSize?: number;
  labelMinWidth?: number;
  onNodeClick?: (node: SankeyNode) => void;
  onLinkClick?: (link: SankeyLink) => void;
}

interface PositionedNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
}

interface PositionedLink extends SankeyLink {
  sourceNode: PositionedNode;
  targetNode: PositionedNode;
  y0: number;
  y1: number;
  width: number;
}

/**
 * High-performance Sankey diagram component using Canvas
 * Features:
 * - Cubic Bézier curves for smooth flow visualization
 * - Accurate hit testing for interaction
 * - Label culling for small flows
 * - Hover labels for better UX
 */
export class SankeyCanvas extends React.Component<SankeyCanvasProps> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private positionedNodes: PositionedNode[] = [];
  private positionedLinks: PositionedLink[] = [];
  private hoveredNode: PositionedNode | null = null;
  private hoveredLink: PositionedLink | null = null;
  private animationFrameId: number | null = null;

  static defaultProps = {
    width: 800,
    height: 600,
    nodeWidth: 15,
    nodePadding: 8,
    labelFontSize: 12,
    labelMinWidth: 50,
  };

  componentDidMount() {
    this.calculateLayout();
    this.draw();
  }

  componentDidUpdate(prevProps: SankeyCanvasProps) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.calculateLayout();
      this.draw();
    }
  }

  componentWillUnmount() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Calculate the layout positions for all nodes and links
   */
  private calculateLayout() {
    const { data, width = 800, height = 600, nodeWidth = 15, nodePadding = 8 } = this.props;
    
    // Build node map
    const nodeMap = new Map<string, PositionedNode>();
    data.nodes.forEach(node => {
      nodeMap.set(node.id, {
        ...node,
        x: 0,
        y: 0,
        width: nodeWidth,
        height: 0,
        value: 0,
      });
    });

    // Calculate node values (sum of incoming or outgoing links)
    data.links.forEach(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      if (sourceNode) sourceNode.value += link.value;
      if (targetNode) targetNode.value += link.value;
    });

    // Assign nodes to columns using a simple algorithm
    const columns: string[][] = [];
    const visited = new Set<string>();
    const nodeColumn = new Map<string, number>();

    // Find source nodes (no incoming links)
    const incomingLinks = new Map<string, SankeyLink[]>();
    const outgoingLinks = new Map<string, SankeyLink[]>();
    
    data.links.forEach(link => {
      if (!incomingLinks.has(link.target)) {
        incomingLinks.set(link.target, []);
      }
      incomingLinks.get(link.target)!.push(link);
      
      if (!outgoingLinks.has(link.source)) {
        outgoingLinks.set(link.source, []);
      }
      outgoingLinks.get(link.source)!.push(link);
    });

    // Assign columns using breadth-first approach
    const queue: Array<{ id: string; column: number }> = [];
    
    data.nodes.forEach(node => {
      if (!incomingLinks.has(node.id)) {
        queue.push({ id: node.id, column: 0 });
      }
    });

    while (queue.length > 0) {
      const { id, column } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      if (!columns[column]) columns[column] = [];
      columns[column].push(id);
      nodeColumn.set(id, column);
      
      const outgoing = outgoingLinks.get(id) || [];
      outgoing.forEach(link => {
        if (!visited.has(link.target)) {
          queue.push({ id: link.target, column: column + 1 });
        }
      });
    }

    // Handle any unvisited nodes (isolated or in cycles)
    data.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const lastColumn = columns.length;
        if (!columns[lastColumn]) columns[lastColumn] = [];
        columns[lastColumn].push(node.id);
        nodeColumn.set(node.id, lastColumn);
      }
    });

    // Calculate x positions
    const columnWidth = (width - nodeWidth) / Math.max(columns.length - 1, 1);
    
    columns.forEach((column, i) => {
      column.forEach(nodeId => {
        const node = nodeMap.get(nodeId)!;
        node.x = i * columnWidth;
      });
    });

    // Calculate y positions and heights
    columns.forEach(column => {
      const totalValue = column.reduce((sum, nodeId) => {
        return sum + nodeMap.get(nodeId)!.value;
      }, 0);
      
      const totalPadding = (column.length - 1) * nodePadding;
      const availableHeight = height - totalPadding;
      const scale = availableHeight / totalValue;
      
      let currentY = 0;
      column.forEach(nodeId => {
        const node = nodeMap.get(nodeId)!;
        node.y = currentY;
        node.height = node.value * scale;
        currentY += node.height + nodePadding;
      });
    });

    this.positionedNodes = Array.from(nodeMap.values());

    // Calculate link positions
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();
    
    this.positionedLinks = data.links.map(link => {
      const sourceNode = nodeMap.get(link.source)!;
      const targetNode = nodeMap.get(link.target)!;
      
      const sourceOffset = sourceOffsets.get(link.source) || 0;
      const targetOffset = targetOffsets.get(link.target) || 0;
      
      const linkHeight = (link.value / sourceNode.value) * sourceNode.height;
      
      const positionedLink: PositionedLink = {
        ...link,
        sourceNode,
        targetNode,
        y0: sourceNode.y + sourceOffset,
        y1: targetNode.y + targetOffset,
        width: linkHeight,
      };
      
      sourceOffsets.set(link.source, sourceOffset + linkHeight);
      targetOffsets.set(link.target, targetOffset + linkHeight);
      
      return positionedLink;
    });
  }

  /**
   * Draw the Sankey diagram on canvas
   */
  private draw = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width = 800, height = 600, labelFontSize = 12, labelMinWidth = 50 } = this.props;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw links with cubic Bézier curves
    this.positionedLinks.forEach(link => {
      const isHovered = link === this.hoveredLink;
      
      ctx.save();
      ctx.globalAlpha = isHovered ? 0.8 : 0.4;
      ctx.fillStyle = link.color || '#888';

      // Create path for the link
      const path = this.createLinkPath(link);
      ctx.fill(path);
      
      ctx.restore();
    });

    // Draw nodes
    this.positionedNodes.forEach(node => {
      const isHovered = node === this.hoveredNode;
      
      ctx.fillStyle = node.color || '#333';
      ctx.fillRect(node.x, node.y, node.width, node.height);
      
      // Draw border for hovered node
      if (isHovered) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(node.x, node.y, node.width, node.height);
      }
    });

    // Draw labels with culling
    ctx.font = `${labelFontSize}px sans-serif`;
    ctx.textBaseline = 'middle';
    
    this.positionedNodes.forEach(node => {
      // Only draw label if node is tall enough
      if (node.height < labelMinWidth / 4) return;
      
      const labelX = node.x + node.width + 6;
      const labelY = node.y + node.height / 2;
      
      ctx.fillStyle = '#000';
      ctx.fillText(node.label, labelX, labelY);
    });

    // Draw hover label for hovered link
    if (this.hoveredLink) {
      const link = this.hoveredLink;
      const midX = (link.sourceNode.x + link.sourceNode.width + link.targetNode.x) / 2;
      const midY = (link.y0 + link.width / 2 + link.y1 + link.width / 2) / 2;
      
      const labelText = `${link.value}`;
      const metrics = ctx.measureText(labelText);
      const padding = 4;
      
      // Draw label background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(
        midX - metrics.width / 2 - padding,
        midY - labelFontSize / 2 - padding,
        metrics.width + padding * 2,
        labelFontSize + padding * 2
      );
      
      // Draw label border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        midX - metrics.width / 2 - padding,
        midY - labelFontSize / 2 - padding,
        metrics.width + padding * 2,
        labelFontSize + padding * 2
      );
      
      // Draw label text
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(labelText, midX, midY);
      ctx.textAlign = 'left';
    }
  };

  /**
   * Create a Path2D for a link using cubic Bézier curves
   * Ensures the link properly aligns with the source and target nodes
   */
  private createLinkPath(link: PositionedLink): Path2D {
    const path = new Path2D();
    
    const x0 = link.sourceNode.x + link.sourceNode.width;
    const x1 = link.targetNode.x;
    const y0 = link.y0;
    const y1 = link.y1;
    const width = link.width;
    
    // Calculate control points for cubic Bézier curve
    const curvature = 0.5;
    const xi = (x0 + x1) * curvature;
    
    // Start at top of source
    path.moveTo(x0, y0);
    
    // Curve to top of target
    path.bezierCurveTo(xi, y0, xi, y1, x1, y1);
    
    // Line down the target side
    path.lineTo(x1, y1 + width);
    
    // Curve back to bottom of source
    path.bezierCurveTo(xi, y1 + width, xi, y0 + width, x0, y0 + width);
    
    // Close the path
    path.closePath();
    
    return path;
  }

  /**
   * Handle mouse move for hover effects
   */
  private handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let newHoveredNode: PositionedNode | null = null;
    let newHoveredLink: PositionedLink | null = null;

    // Check if mouse is over a node
    for (const node of this.positionedNodes) {
      if (
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
      ) {
        newHoveredNode = node;
        break;
      }
    }

    // If not over a node, check if over a link
    if (!newHoveredNode) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        for (const link of this.positionedLinks) {
          const path = this.createLinkPath(link);
          if (ctx.isPointInPath(path, x, y)) {
            newHoveredLink = link;
            break;
          }
        }
      }
    }

    // Update hover state if changed
    if (newHoveredNode !== this.hoveredNode || newHoveredLink !== this.hoveredLink) {
      this.hoveredNode = newHoveredNode;
      this.hoveredLink = newHoveredLink;
      this.draw();
    }

    // Update cursor
    if (newHoveredNode || newHoveredLink) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  /**
   * Handle mouse click
   */
  private handleClick = () => {
    if (this.hoveredNode && this.props.onNodeClick) {
      this.props.onNodeClick(this.hoveredNode);
    } else if (this.hoveredLink && this.props.onLinkClick) {
      this.props.onLinkClick(this.hoveredLink);
    }
  };

  /**
   * Handle mouse leave
   */
  private handleMouseLeave = () => {
    if (this.hoveredNode || this.hoveredLink) {
      this.hoveredNode = null;
      this.hoveredLink = null;
      this.draw();
    }
    
    const canvas = this.canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  };

  render() {
    const { width = 800, height = 600 } = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        width={width}
        height={height}
        onMouseMove={this.handleMouseMove}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        style={{ display: 'block' }}
      />
    );
  }
}
