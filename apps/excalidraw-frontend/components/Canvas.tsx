import { Circle, Pencil, RectangleHorizontalIcon, ArrowRight, Type, Pointer } from "lucide-react";
import { useRef,useEffect, useState } from "react";
import { IconButton } from "./IconButton";
import { Game } from "@/draw/Game";

export type Tool = | "select" | "circle" | "rect" | "pencil" | "arrow" | "text";


export function Canvas({
    roomId,
    socket
}: {
    roomId: string;
    socket: WebSocket;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool>("select")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool}/>
    </div>
}

function Topbar({selectedTool, setSelectedTool} : {
    selectedTool: Tool,
    setSelectedTool: (t: Tool) => void
}) {
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10
    }}>
        <div className="flex gap-2">
            <IconButton activated={selectedTool === "select"} icon={<Pointer />} onclick={() => {setSelectedTool("select")}}></IconButton>
            <IconButton activated={selectedTool === "pencil"} icon={<Pencil />} onclick={() => {setSelectedTool("pencil")}}></IconButton>
            <IconButton activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} onclick={() => {setSelectedTool("rect")}}></IconButton>
            <IconButton activated={selectedTool === "circle"} icon={<Circle />} onclick={() => {setSelectedTool("circle")}}></IconButton>
            <IconButton activated={selectedTool === "text"} icon={<Type />} onclick={() => {setSelectedTool("text")}}></IconButton>
            <IconButton activated={selectedTool === "arrow"} icon={<ArrowRight />} onclick={() => {setSelectedTool("arrow")}}></IconButton>
        </div>
    </div>
}