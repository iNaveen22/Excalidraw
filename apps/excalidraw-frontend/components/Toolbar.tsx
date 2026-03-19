import { MousePointer2, Pencil, Square, Circle, ArrowRight, Text, Eraser, Hand } from 'lucide-react';
import { Tool } from '../types/drawing';

interface ToolbarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

export default function Toolbar({ selectedTool, setSelectedTool }: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'select' },
    { id: 'hand' as Tool, icon: Hand, label: 'hand' },
    { id: 'pencil' as Tool, icon: Pencil, label: 'pencil' },
    { id: 'rect' as Tool, icon: Square, label: 'rect' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'arrow' as Tool, icon: ArrowRight, label: 'arrow' },
    { id: 'text' as Tool, icon: Text, label: 'text' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'eraser' },
  ];

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 px-3 py-2 flex gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              selectedTool === tool.id
                ? 'bg-amber-200 text-amber-900 shadow-md scale-105'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
            title={tool.label}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
}
