import { Tool } from "../types/drawing";
import { getExistingShapes } from "./http";

type Base = {
    id: string;
};

type Style = {
    strokeColor: string;
    strokeWidth: number;
}

type Shape =
    | (Base & Style & { type: "rect"; x: number; y: number; width: number; height: number })
    | (Base & Style & { type: "circle"; centerX: number; centerY: number; radius: number })
    | (Base & Style & { type: "pencil"; points: { x: number; y: number }[] })
    | (Base & Style & { type: "arrow"; x1: number; y1: number; x2: number; y2: number })
    | (Base & Style & { type: "text"; x: number; y: number; text: string });

type Handle = "nw" | "ne" | "se" | "sw"

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[] = [];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "select";
    private socket: WebSocket;

    private currentStrokeColor = "#ffffff";
    private currentStrokeWidth = 2;

    private camera = { x: 0, y: 0, zoom: 1 };

    //for resizing shpaes
    private isResizing = false;
    private resizeHandle: Handle | null = null;
    //this is for storing the moving rectangle while resizing means preview
    private resizeStartRect: { x: number; y: number; width: number; height: number } | null = null;
    private HANDLE_SIZE = 10;


    //for no duplicate shapes, generating clientid and when broadcasting happen then this shape should not came twice to his sender's room
    private clientId = crypto.randomUUID();

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        // this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
        // this.clearCanvas();
    }

    private erasedDuringDrag = new Set<string>();

    private selectedShapeIndex: number | null = null;
    private isDraggingShape = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;
    //for rectangle 
    private isPointInRect(x: number, y: number, rect: any) {
        return (
            x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
        );
    }
    //for circle
    private isPointInCircle(x: number, y: number, circle: any) {
        const dx = x - circle.centerX;
        const dy = y - circle.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= circle.radius;

    }

    //finding distance of mouse point from line segment
    private distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, dot / lenSq));

        const projX = x1 + t * C;
        const projY = y1 + t * D;

        const dx = px - projX;
        const dy = py - projY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private findShapeAtPoint(x: number, y: number): number | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];

            if (shape.type === "rect" && this.isPointInRect(x, y, shape)) {
                return i;
            }

            if (shape.type === "circle" && this.isPointInCircle(x, y, shape)) {
                return i;
            }

            if (shape.type === "pencil") {
                const pts = shape.points;
                for (let j = 1; j < pts.length; j++) {
                    const d = this.distToSegment(x, y, pts[j - 1].x, pts[j - 1].y, pts[j].x, pts[j].y);
                    if (d <= 5) return i;
                }
            }

            if (shape.type === "text") {
                this.ctx.font = "16px sans-serif";
                const w = this.ctx.measureText(shape.text).width;
                const h = 16;
                if (x >= shape.x && x <= shape.x + w && y <= shape.y && y >= shape.y - h) return i;
            }

            if (shape.type === "arrow") {
                const threshold = 8;
                const d = this.distToSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
                if (d <= threshold) return i;
            }

        }
        return null;
    }


    //handler function to draw four small squares on rect
    private drawRectHandles(x: number, y: number, w: number, h: number) {
        const s = this.HANDLE_SIZE / this.camera.zoom;
        const half = s / 2;

        const points = [
            { hx: x, hy: y, h: "nw" as const },
            { hx: x + w, hy: y, h: "ne" as const },
            { hx: x, hy: y + h, h: "sw" as const },
            { hx: x + w, hy: y + h, h: "se" as const },
        ];

        this.ctx.setLineDash([]);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";

        for (const p of points) {
            this.ctx.beginPath();
            this.ctx.rect(p.hx - half, p.hy - half, s, s);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    //handler function o which square user had clicked
    private getRectHandleAtPoint(rect: { x: number; y: number; width: number; height: number }, mx: number, my: number): Handle | null {
        const s = this.HANDLE_SIZE / this.camera.zoom;
        const half = s / 2;

        const handles = [
            { x: rect.x, y: rect.y, h: "nw" as const },
            { x: rect.x + rect.width, y: rect.y, h: "ne" as const },
            { x: rect.x, y: rect.y + rect.height, h: "sw" as const },
            { x: rect.x + rect.width, y: rect.y + rect.height, h: "se" as const },
        ];

        for (const hd of handles) {
            const left = hd.x - half;
            const top = hd.y - half;

            if (mx >= left && mx <= left + s && my >= top && my <= top + s) {
                return hd.h;
            }
        }

        return null;
    }

    //for erasinggg
    private eraseAtPoint(x: number, y: number) {
        while (true) {
            const hitIndex = this.findShapeAtPoint(x, y);
            if (hitIndex === null) break;

            const hit = this.existingShapes[hitIndex];
            if (this.erasedDuringDrag.has(hit.id)) break;
            this.erasedDuringDrag.add(hit.id);

            const deleted = this.existingShapes.splice(hitIndex, 1)[0];

            this.selectedShapeIndex = null;
            this.clearCanvas();

            this.socket.send(JSON.stringify({
                type: "shape:delete",
                roomId: this.roomId,
                shapeId: hit.id,
                clientId: this.clientId,
            }));
        }
    }

    //panning
    private isPanning = false;
    private panStart = { sx: 0, sy: 0, camX: 0, camY: 0 };

    //zoom wheel
    private wheelHandler = (e: WheelEvent) => {
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        const worldX = this.camera.x + sx / this.camera.zoom;
        const worldY = this.camera.y + sy / this.camera.zoom;

        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const nextZoom = Math.min(4, Math.max(0.2, this.camera.zoom * zoomFactor));
        this.camera.zoom = nextZoom;

        this.camera.x = worldX - sx / this.camera.zoom;
        this.camera.y = worldY - sy / this.camera.zoom;

        this.clearCanvas();
    };


    setStrokeColor(color: string) {
        this.currentStrokeColor = color;
    }

    setStrokeWidth(width: number) {
        this.currentStrokeWidth = width;
    }

    //clicked pointt coordinatess
    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        const x = this.camera.x + sx / this.camera.zoom;
        const y = this.camera.y + sy / this.camera.zoom;

        return { x, y, sx, sy }
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener("wheel", this.wheelHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
        if (tool !== "select") this.selectedShapeIndex = null;

        this.canvas.style.cursor =
            tool === "hand" ? "grab" :
                tool === "eraser" ? "cell" :
                    tool === "select" ? "default" : "crosshair";
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        for (const s of this.existingShapes) this.appliedShapeIds.add(s.id);
        this.clearCanvas();
    }

    private appliedShapeIds = new Set<string>();

    //initializer handlerrr
    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.clientId && message.clientId === this.clientId) return;

            if (message.type === "shape:create") {
                const shape: Shape = message.shape;
                if (!shape?.id) return;

                if (this.appliedShapeIds.has(shape.id)) return;
                this.appliedShapeIds.add(shape.id);

                this.existingShapes.push(shape);
                this.clearCanvas();
                return;
            }

            if (message.type === "shape:update") {
                const shapeId: string = message.shapeId;
                const data = message.data;

                if (!shapeId || !data) return;

                const idx = this.existingShapes.findIndex(s => s.id === shapeId);
                if (idx === -1) return;

                this.existingShapes[idx] = { ...this.existingShapes[idx], ...data } as Shape;
                this.clearCanvas();
                return;
            }

            if (message.type === "shape:delete") {
                const shapeId: string = message.shapeId;
                if (!shapeId) return;

                this.existingShapes = this.existingShapes.filter(s => s.id !== shapeId);
                if (this.selectedShapeIndex !== null) {
                    const selected = this.existingShapes[this.selectedShapeIndex];
                    if (!selected) this.selectedShapeIndex = null;
                }
                this.clearCanvas();
                return;
            }
        }
    }


    private currentPencilPoints: { x: number; y: number }[] = [];
    private drawCurrentPencil() {
        const pts = this.currentPencilPoints;
        if (pts.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].x, pts[i].y);
        }

        this.ctx.stroke();
    }



    private drawArrow(x1: number, y1: number, x2: number, y2: number) {
        const ctx = this.ctx;
        const headLen = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLen * Math.cos(angle - Math.PI / 6),
            y2 - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x2 - headLen * Math.cos(angle + Math.PI / 6),
            y2 - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.lineTo(x2, y2);
        ctx.fillStyle = ctx.strokeStyle as string;
        ctx.fill();
    }


    private clearCanvas() {
        const ctx = this.ctx;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.setTransform(
            this.camera.zoom, 0,
            0, this.camera.zoom,
            -this.camera.x * this.camera.zoom,
            -this.camera.y * this.camera.zoom
        )

        this.existingShapes.forEach((shape, index) => {

            const isSelected = index === this.selectedShapeIndex;

            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = shape.strokeColor ?? "#fff";
            this.ctx.lineWidth = shape.strokeWidth ?? 2;

            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                if (isSelected) {
                    this.ctx.setLineDash([]);
                    this.drawRectHandles(shape.x, shape.y, shape.width, shape.height);
                }
            }

            else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            else if (shape.type === "pencil") {
                const pts = shape.points;
                if (pts.length < 2) return;

                this.ctx.beginPath();

                this.ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    // this.ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                    this.ctx.lineTo(pts[i].x, pts[i].y);
                }
                this.ctx.stroke();
            }

            else if (shape.type === "arrow") {
                this.drawArrow(shape.x1, shape.y1, shape.x2, shape.y2)
            }

            else if (shape.type === "text") {
                this.ctx.setLineDash([]);
                this.ctx.fillStyle = isSelected
                    ? "rgba(0, 200, 255, 1)"
                    : shape.strokeColor;
                this.ctx.font = "16px sans-serif";
                this.ctx.fillText(shape.text, shape.x, shape.y);
            }

            if (isSelected) {
                this.ctx.save();
                this.ctx.setLineDash([6, 4]);
                this.ctx.strokeStyle = "rgba(0, 200, 255, 1)";
                this.ctx.lineWidth = 2 / this.camera.zoom;

                if (shape.type === "rect") {
                    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    this.drawRectHandles(shape.x, shape.y, shape.width, shape.height);
                }
                this.ctx.restore();
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        const { x, y, sx, sy } = this.getMousePos(e);
        if (this.isPanning) return;

        // Middle mouse OR Space pressed (if you track keys) OR right click etc
        const shouldPan = this.selectedTool === "hand" || e.button === 1;
        if (shouldPan) {
            e.preventDefault();
            this.isPanning = true;
            this.panStart = { sx, sy, camX: this.camera.x, camY: this.camera.y };
            this.clicked = true;
            return;
        }


        if (this.selectedTool === "eraser") {
            this.clicked = true;
            this.erasedDuringDrag.clear();
            this.eraseAtPoint(x, y);
            return;
        }


        if (this.selectedTool === "select") {
            const hitIndex = this.findShapeAtPoint(x, y);

            if (hitIndex === null) {
                this.clicked = false;
                this.selectedShapeIndex = null;
                this.clearCanvas();
                return;
            }

            this.clicked = true;
            this.startX = x;
            this.startY = y;

            this.selectedShapeIndex = hitIndex;
            const shape = this.existingShapes[hitIndex];

            if (shape.type === "rect") {
                const handle = this.getRectHandleAtPoint(shape, x, y);
                if (handle) {
                    this.isResizing = true;
                    this.resizeHandle = handle;
                    this.resizeStartRect = { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
                    this.clearCanvas();
                    return;
                }
            }


            this.isDraggingShape = true;

            if (shape.type === "rect") {
                this.dragOffsetX = x - shape.x;
                this.dragOffsetY = y - shape.y;
            }
            if (shape.type === "circle") {
                this.dragOffsetX = x - shape.centerX;
                this.dragOffsetY = y - shape.centerY;
            }
            this.clearCanvas();
            return;
        }
        this.clicked = true;
        this.startX = x;
        this.startY = y;
        this.selectedShapeIndex = null;

        if (this.selectedTool === "text") {
            const text = prompt("Enter text");
            if (!text) {
                this.clicked = false;
                return
            };

            const shape: Shape = {
                id: crypto.randomUUID(),
                strokeColor: this.currentStrokeColor,
                strokeWidth: this.currentStrokeWidth,
                type: "text",
                x,
                y,
                text,
            };

            this.existingShapes.push(shape);
            this.appliedShapeIds.add(shape.id);
            this.clearCanvas();

            this.socket.send(JSON.stringify({
                type: "shape:create",
                roomId: this.roomId,
                shape,
                clientId: this.clientId,
            }));

            this.selectedTool = "select";
            this.selectedShapeIndex = this.existingShapes.length - 1;
            return;
        }

        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x, y }];
        }

    }

    mouseUpHandler = (e: MouseEvent) => {

        if (this.isPanning) {
            this.isPanning = false;
            this.clicked = false;
            if (this.selectedTool === "hand") this.canvas.style.cursor = "grab";
            return;
        }

        if (this.selectedTool === "eraser") {
            this.clicked = false;
            this.erasedDuringDrag.clear();
            return;
        }

        if (!this.clicked) return;
        this.clicked = false;

        if (this.isResizing) {
            this.isResizing = false;

            if (this.selectedShapeIndex !== null) {
                const shape = this.existingShapes[this.selectedShapeIndex];
                if (shape?.type === "rect") {
                    this.socket.send(JSON.stringify({
                        type: "shape:update",
                        roomId: this.roomId,
                        shapeId: shape.id,
                        data: { x: shape.x, y: shape.y, width: shape.width, height: shape.height },
                        clientId: this.clientId,
                    }));
                }
            }
            this.resizeHandle = null;
            this.resizeStartRect = null;
            this.clearCanvas();
            return;
        }


        if (this.isDraggingShape) {
            this.isDraggingShape = false;

            if (this.selectedShapeIndex !== null) {
                const shape = this.existingShapes[this.selectedShapeIndex];

                if (shape.type === "rect") {
                    this.socket.send(JSON.stringify({
                        type: "shape:update",
                        roomId: this.roomId,
                        shapeId: shape.id,
                        data: { x: shape.x, y: shape.y, width: shape.width, height: shape.height },
                        clientId: this.clientId,
                    }));
                }

                if (shape.type === "circle") {
                    this.socket.send(JSON.stringify({
                        type: "shape:update",
                        roomId: this.roomId,
                        shapeId: shape.id,
                        data: { centerX: shape.centerX, centerY: shape.centerY, radius: shape.radius },
                        clientId: this.clientId,
                    }));
                }
            }

            this.clearCanvas();
            return;
        }



        if (this.selectedTool === "select") {
            this.clearCanvas();
            return;
        }


        const { x, y } = this.getMousePos(e);
        const width = x - this.startX;
        const height = y - this.startY;

        const selectedTool = this.selectedTool;
        const id = crypto.randomUUID();
        let shape: Shape | null = null;
        if (selectedTool === "rect") {
            shape = {
                id,
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
                strokeColor: this.currentStrokeColor,
                strokeWidth: this.currentStrokeWidth
            }
        }

        if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                id,
                type: "circle",
                centerX: this.startX + radius,
                centerY: this.startY + radius,
                radius: Math.abs(radius),
                strokeColor: this.currentStrokeColor,
                strokeWidth: this.currentStrokeWidth
            }
        }

        if (this.selectedTool === "pencil") {
            shape = {
                id,
                type: "pencil",
                points: this.currentPencilPoints,
                strokeColor: this.currentStrokeColor,
                strokeWidth: this.currentStrokeWidth
            };
        }

        if (this.selectedTool === "arrow") {
            shape = {
                id,
                type: "arrow",
                x1: this.startX,
                y1: this.startY,
                x2: x,
                y2: y,
                strokeColor: this.currentStrokeColor,
                strokeWidth: this.currentStrokeWidth
            }
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);
        this.appliedShapeIds.add(shape.id);

        this.selectedShapeIndex = this.existingShapes.length - 1;
        this.selectedTool = "select";

        this.isDraggingShape = false;
        this.isResizing = false;
        this.clearCanvas();

        console.log("CREATE SHAPE", shape.strokeColor, shape.strokeWidth, shape);

        this.socket.send(JSON.stringify({
            type: "shape:create",
            shape,
            roomId: this.roomId,
            clientId: this.clientId,
        }));
        this.currentPencilPoints = [];
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        const { x, y, sx, sy } = this.getMousePos(e);

        if (this.isPanning) {
            const dx = (sx - this.panStart.sx) / this.camera.zoom;
            const dy = (sy - this.panStart.sy) / this.camera.zoom;

            this.camera.x = this.panStart.camX - dx;
            this.camera.y = this.panStart.camY - dy;

            this.clearCanvas();
            return;
        }


        if (this.selectedTool === "eraser") {
            if (!this.clicked) return;
            this.eraseAtPoint(x, y);
            return;
        }

        const width = x - this.startX;
        const height = y - this.startY;

        if (this.isResizing && this.selectedShapeIndex !== null && this.resizeStartRect && this.resizeHandle) {
            const shape = this.existingShapes[this.selectedShapeIndex];
            if (shape.type !== "rect") return;

            const start = this.resizeStartRect;
            const left = start.x;
            const top = start.y;
            const right = start.x + start.width;
            const bottom = start.y + start.height;

            let newLeft = left;
            let newTop = top;
            let newRight = right;
            let newBottom = bottom;

            if (this.resizeHandle === "nw") {
                newLeft = x;
                newTop = y;
            } else if (this.resizeHandle === "ne") {
                newRight = x;
                newTop = y;
            } else if (this.resizeHandle === "sw") {
                newLeft = x;
                newBottom = y;
            } else if (this.resizeHandle === "se") {
                newRight = x;
                newBottom = y;
            }

            const minSize = 10;
            shape.x = Math.min(newLeft, newRight);
            shape.y = Math.min(newTop, newBottom);
            shape.width = Math.max(minSize, Math.abs(newRight - newLeft));
            shape.height = Math.max(minSize, Math.abs(newBottom - newTop));

            this.clearCanvas();
            return;
        }


        if (this.isDraggingShape && this.selectedShapeIndex !== null) {
            const shape = this.existingShapes[this.selectedShapeIndex];

            if (shape.type === "rect") {
                shape.x = x - this.dragOffsetX;
                shape.y = y - this.dragOffsetY;
            }

            if (shape.type === "circle") {
                shape.centerX = x - this.dragOffsetX;
                shape.centerY = y - this.dragOffsetY;
            }

            this.clearCanvas();
            return;
        }

        if (this.selectedTool === "select") {
            return;
        }

        this.clearCanvas();

        this.ctx.strokeStyle = this.currentStrokeColor;
        const selectedTool = this.selectedTool;
        console.log(selectedTool)

        if (selectedTool === "rect") {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        }

        if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            const centerX = this.startX + radius;
            const centerY = this.startY + radius;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
            this.ctx.stroke();
            // this.ctx.closePath();
        }

        if (selectedTool === "pencil") {
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = this.currentStrokeWidth;

            this.currentPencilPoints.push({ x, y });

            this.drawCurrentPencil();
        }

        if (selectedTool === "arrow") {
            this.drawArrow(this.startX, this.startY, x, y);
        }

    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.addEventListener("wheel", this.wheelHandler);

    }
}