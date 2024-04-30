export interface IPosition {
    x: number
    y: number
}

export interface ICoordinates extends IPosition {
    width: number
    height: number
}

export class Node {
    title: string = '';
    // image!: HTMLImageElement;
    isHovered = false;
    buttonSize = 16;
    childHeight: number = 0;
    deleteButton: ICoordinates = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    addButton: ICoordinates = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    constructor(
        public id: number,
        public coords: ICoordinates,
        public connection: IConnection,
        public scale: number,
        public isRoot: boolean = false,
    ) {
        this.setButtons(this.scale);
    }

    setButtons(scale: number) {
        this.addButton = {
            x: this.coords.x + (this.coords.width * scale) + ((this.buttonSize * scale) / 2),
            y: this.coords.y + ((this.coords.height * scale) / 2),
            width: this.buttonSize * scale,
            height: this.buttonSize * scale
        }
        this.deleteButton = {
            x: this.coords.x + (this.coords.width * scale) - (6 * scale) / 2,
            y: this.coords.y - (this.buttonSize * scale) / 2,
            width: (this.buttonSize * scale),
            height: (this.buttonSize * scale)
        }
    }

    drawButtons(ctx: CanvasRenderingContext2D, scale: number) {
        ctx.save();
        ctx.fillStyle = '#2C76FF';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2 * scale;

        // for rendering add button
        ctx.beginPath();
        ctx.arc(this.addButton.x, this.addButton.y, this.buttonSize * scale / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.addButton.x - (this.buttonSize * scale) / 2 + (3 * scale), this.addButton.y);
        ctx.lineTo(this.addButton.x + (this.buttonSize * scale) / 2 - (3 * scale), this.addButton.y);
        ctx.moveTo(this.addButton.x, this.addButton.y - (this.buttonSize * scale) / 2 + (3 * scale));
        ctx.lineTo(this.addButton.x, this.addButton.y + (this.buttonSize * scale) / 2 - (3 * scale));
        ctx.stroke();

        // for rendering delete button
        if (!this.isRoot) {
            ctx.fillStyle = 'rgb(210, 4, 45)'
            ctx.fillRect(this.deleteButton.x, this.deleteButton.y, this.deleteButton.width, this.deleteButton.height);
            ctx.beginPath();
            ctx.moveTo(this.deleteButton.x + (3 * scale), this.deleteButton.y + (3 * scale))
            ctx.lineTo(this.deleteButton.x + (this.buttonSize - 3) * scale, this.deleteButton.y + (this.buttonSize - 3) * scale);
            ctx.moveTo(this.deleteButton.x + (this.buttonSize - 3) * scale, this.deleteButton.y + (3 * scale));
            ctx.lineTo(this.deleteButton.x + (3 * scale), this.deleteButton.y + (this.buttonSize - 3) * scale);
            ctx.stroke()
        }
        ctx.restore();
    }

}

export interface IConnection {
    connectionType: ConnectionType,
    to: number[]
}
export type ArrowAngle = 'top' | 'down' | 'right' | 'left';
export type ConnectionType = 'none' | 'one-to-one' | 'one-to-many' | 'many-to-one' | 'ternary';
export type FillStyle = 'stroke' | 'fill';


export function roundedRect(ctx: any, coords: ICoordinates, radius: number, fillStyle: FillStyle, color: string, tl = false, tr = false, br = false, bl = false) {
    let { x, y, width, height } = coords;
    ctx.save();

    ctx.beginPath();
    if (tl) {
        ctx.moveTo(x + radius, y);
    } else {
        ctx.moveTo(x, y);
    }

    if (tr) {
        ctx.arcTo(x + width, y, x + width, y + radius, radius)
    } else {
        ctx.lineTo(x + width, y);
    }

    if (br) {
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    } else {
        ctx.lineTo(x + width, y + height);
    }

    if (bl) {
        ctx.arcTo(x, y + height, x, y + height - radius, radius)
    } else {
        ctx.lineTo(x, y + height);
    }
    
    if (tl) {
        ctx.arcTo(x, y, x + radius, y, radius);
    }

    ctx.closePath();
    if (fillStyle == 'fill') {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    ctx.restore();

}