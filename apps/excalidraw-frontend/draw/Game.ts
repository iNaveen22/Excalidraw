import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
    | {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
    } | {
        type: "circle";
        centerX: number;
        centerY: number;
        radius: number;
    } | {
        type: "pencil";
        points: { x: number, y: number }[];
    } | {
        type: "arrow";
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    } | {
        type: "text";
        x: number;
        y: number;
        text: string;
    };

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[] = [];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "select";
    private justFinishedDrawing = false;

    private socket: WebSocket;

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
    }

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

    private findShapeAtPoint(x: number, y: number): number | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];

            if (shape.type === "rect" && this.isPointInRect(x, y, shape)) {
                return i;
            }

            if (shape.type === "circle" && this.isPointInCircle(x, y, shape)) {
                return i;
            }
        }
        return null;
    }


    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
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
        ctx.fillStyle = "white";
        ctx.fill();
    }


    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);



        this.existingShapes.forEach((shape, index) => {

            const isSelected = index === this.selectedShapeIndex;

            if (isSelected) {
                this.ctx.setLineDash([6, 4]);
                this.ctx.strokeStyle = "rgba(0, 200, 255, 1)";
            } else {
                this.ctx.setLineDash([]);
                this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
            }

            // this.ctx.strokeStyle = "rgba(255, 255, 255)";
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
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

                for (let i = 1; i < pts.length; i++) {
                    this.ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                    this.ctx.lineTo(pts[i].x, pts[i].y);
                }
                this.ctx.stroke();
            }

            else if (shape.type === "arrow") {
                this.drawArrow(shape.x1, shape.y1, shape.x2, shape.y2)
            }

            else if (shape.type === "text") {
                this.ctx.setLineDash([]); // text should never be dashed
                this.ctx.fillStyle = isSelected
                    ? "rgba(0, 200, 255, 1)"
                    : "white";
                this.ctx.font = "16px sans-serif";
                this.ctx.fillText(shape.text, shape.x, shape.y);
            }
            this.ctx.setLineDash([]);
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        const { x, y } = this.getMousePos(e);
        this.clicked = true;
        this.startX = x;
        this.startY = y;

        //shape dragging...
        if(this.justFinishedDrawing){
            this.justFinishedDrawing = false;
            return;
        }
        const hitIndex = this.findShapeAtPoint(x, y);

        if (hitIndex !== null) {
            this.selectedShapeIndex = hitIndex;
            this.isDraggingShape = true;
            console.log({
                tool: this.selectedTool,
                hit: hitIndex,
                dragging: this.isDraggingShape
            });

            const shape = this.existingShapes[hitIndex];

            if (shape.type === "rect") {
                this.dragOffsetX = x - shape.x;
                this.dragOffsetY = y - shape.y;
            }
            if (shape.type === "circle") {
                this.dragOffsetX = x - shape.centerX;
                this.dragOffsetY = y - shape.centerY;
            }
            return;
        }


        if (this.selectedTool === "select") {
            return;
        }

        if (this.selectedTool === "text") {
            const text = prompt("Enter text");
            if (!text) return;

            const shape: Shape = {
                type: "text",
                x,
                y,
                text,
            };

            this.existingShapes.push(shape);
            this.clearCanvas();

            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId: this.roomId
            }));

            return;
        }

        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x, y }];
        }

    }
    mouseUpHandler = (e: MouseEvent) => {
        if (!this.clicked) return;
        this.clicked = false;

        if (this.isDraggingShape) {
            this.isDraggingShape = false;
            this.selectedShapeIndex = null;
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
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height
            }
        }

        if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + radius,
                centerY: this.startY + radius,
                radius: Math.abs(radius),
            }
        }

        if (this.selectedTool === "pencil") {
            shape = {
                type: "pencil",
                points: this.currentPencilPoints
            };
        }

        if (this.selectedTool === "arrow") {
            shape = {
                type: "arrow",
                x1: this.startX,
                y1: this.startY,
                x2: x,
                y2: y,
            }
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);
        this.justFinishedDrawing = true;
        this.clearCanvas();

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        const { x, y } = this.getMousePos(e);
        const width = x - this.startX;
        const height = y - this.startY;

        if (this.isDraggingShape && this.selectedShapeIndex !== null) {
            const shape = this.existingShapes[this.selectedShapeIndex];

            if (shape.type === "rect") {
                shape.x = x - this.dragOffsetX;
                shape.y = y - this.dragOffsetY;
            }

            if (shape.type === "circle") {
                shape.centerX = x;
                shape.centerY = y;
            }

            this.clearCanvas();
            return;
        }

        if (this.selectedTool === "select") {
            return;
        }

        this.clearCanvas();

        this.ctx.strokeStyle = "rgba(255, 255, 255)"
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
            this.ctx.lineWidth = 2;

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

    }
}