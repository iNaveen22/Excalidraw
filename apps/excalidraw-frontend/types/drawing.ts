export type Tool = 'select' | 'pencil' | 'rect' | 'circle' | 'line' | 'eraser' | 'hand' | 'arrow' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface DrawElement {
  id: string;
  type: Tool;
  points: Point[];
  color: string;
  strokeWidth: number;
}

export interface ColorTheme {
  name: string;
  colors: string[];
}
