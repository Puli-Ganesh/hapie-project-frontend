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
        public isRoot: boolean = false,
    ) {
        this.setButtons();
    }

    setButtons() {
        this.addButton = {
            x: this.coords.x + this.coords.width - (this.buttonSize / 2),
            y: this.coords.y + (this.coords.height / 2) - (this.buttonSize / 2),
            width: this.buttonSize,
            height: this.buttonSize
        }
        this.deleteButton = {
            x: this.coords.x + this.coords.width - this.buttonSize / 2,
            y: this.coords.y - this.buttonSize / 2,
            width: this.buttonSize,
            height: this.buttonSize
        }
    }

    drawButtons(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = '#0B0BCF';
        ctx.strokeStyle = '#ECECFE';
        ctx.lineWidth = 2;

        // for rendering add button
        ctx.fillRect(this.addButton.x, this.addButton.y, this.addButton.width, this.addButton.height);
        ctx.beginPath();
        ctx.moveTo(this.addButton.x + 2, this.addButton.y + this.buttonSize / 2)
        ctx.lineTo(this.addButton.x + this.buttonSize - 2, this.addButton.y + this.buttonSize / 2);
        ctx.moveTo(this.addButton.x + this.buttonSize / 2, this.addButton.y + 2);
        ctx.lineTo(this.addButton.x + this.buttonSize / 2, this.addButton.y + this.buttonSize - 2);
        ctx.stroke()
        
        // for rendering delete button
        if (!this.isRoot) {
            ctx.fillStyle = 'rgb(210, 4, 45)'
            ctx.fillRect(this.deleteButton.x, this.deleteButton.y, this.deleteButton.width, this.deleteButton.height);
            ctx.beginPath();
            ctx.moveTo(this.deleteButton.x + 3, this.deleteButton.y + 3)
            ctx.lineTo(this.deleteButton.x + this.buttonSize - 3, this.deleteButton.y + this.buttonSize - 3);
            ctx.moveTo(this.deleteButton.x + this.buttonSize - 3, this.deleteButton.y + 3);
            ctx.lineTo(this.deleteButton.x + 3, this.deleteButton.y + this.buttonSize - 3);
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
