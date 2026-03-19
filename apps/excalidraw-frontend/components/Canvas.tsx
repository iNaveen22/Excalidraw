import { Tool } from "@/types/drawing";
import { useRef, useEffect, useState } from "react";
import { Game } from "@/draw/Game";
import Toolbar from "./Toolbar"
import ColorSidebar from "./ColorSidebar"

export function Canvas({
    roomId,
    socket
}: {
    roomId: string;
    socket: WebSocket;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedColor, setSelectedColor] = useState('#2C2416');
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [selectedTool, setSelectedTool] = useState<Tool>("select")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            g.setStrokeColor(selectedColor);
            g.setStrokeWidth(strokeWidth);
            g.setTool(selectedTool);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [roomId, socket]);

    useEffect(() => {
        if (!game) return;
        game.setStrokeColor(selectedColor);
        game.setStrokeWidth(strokeWidth);
    }, [game, selectedColor, strokeWidth]);

    return (
        <div className="h-screen w-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
            {/* toolbar always on top */}
            <div className="fixed top-6 left-151 z-50">
                <Toolbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
            </div>

            {/* main layout */}
            <div className="h-full w-full flex gap-6 p-6">
                {/* canvas area */}
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={window.innerWidth}
                        height={window.innerHeight}
                        className="block"
                    />
                </div>

                {/* sidebar */}
                <div className="w-64 shrink-0">
                    <ColorSidebar
                        selectedColor={selectedColor}
                        onColorChange={setSelectedColor}
                        strokeWidth={strokeWidth}
                        onStrokeWidthChange={setStrokeWidth}
                    />
                </div>
            </div>
        </div>
    );

}