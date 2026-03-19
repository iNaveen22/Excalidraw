import { ColorTheme } from '../types/drawing';

interface ColorSidebarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export default function ColorSidebar({
  selectedColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
}: ColorSidebarProps) {
  const colorThemes: ColorTheme[] = [
    {
      name: 'Warm Neutrals',
      colors: ['#2C2416', '#5C4A32', '#8B7355', '#C9A882', '#E8D5C4'],
    },
    {
      name: 'Sunset',
      colors: ['#FF6B35', '#F7931E', '#FDC830', '#FF9AA2', '#FFB7B2'],
    },
    {
      name: 'Earth Tones',
      colors: ['#6B4423', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'],
    },
    {
      name: 'Soft Pastels',
      colors: ['#FFB6C1', '#FFC8A2', '#FFFACD', '#B5EAD7', '#C7CEEA'],
    },
    {
      name: 'Terracotta',
      colors: ['#E07A5F', '#F2CC8F', '#81B29A', '#F4F1DE', '#D4A373'],
    },
  ];

  const strokeWidths = [2, 4, 6, 8, 12];

  return (
    <div className="absolute right-6 top-6 bottom-6 w-64 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold text-amber-900 mb-4">Color Themes</h2>

      <div className="space-y-6">
        {colorThemes.map((theme) => (
          <div key={theme.name}>
            <h3 className="text-sm font-medium text-amber-700 mb-2">{theme.name}</h3>
            <div className="flex flex-wrap gap-2">
              {theme.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 ${
                    selectedColor === color
                      ? 'ring-2 ring-amber-500 ring-offset-2 scale-110'
                      : 'hover:ring-2 hover:ring-amber-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-amber-700 mb-3">Stroke Width</h3>
        <div className="space-y-2">
          {strokeWidths.map((width) => (
            <button
              key={width}
              onClick={() => onStrokeWidthChange(width)}
              className={`w-full py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                strokeWidth === width
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span className="text-sm">{width}px</span>
              <div
                className="rounded-full bg-current"
                style={{ width: width * 2, height: width }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
