import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { FacadeService } from '@src/app/services/facade.service';
import { IConnection, ICoordinates, IPosition, Node, roundedRect } from './node';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})
export class WorkflowDetailsComponent implements OnInit, OnDestroy {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    this.qpSubscription = this._activatedRoute.params.subscribe({
      next: (params: Params) => {
        if (params && params['workflowId']) {
          this.workflowId = params['workflowId'];
          if (this.workflowId == 'new') {
            this.workflowName = 'new'
            this.editMode = false;
          } else {
            this.editMode = true;
          }
        }
      }
    });
  }

  @ViewChild('addPopup') addPopup!: ElementRef;
  @ViewChild('detailsDrawer') detailsDrawer!: ElementRef;

  workflowName: string = '';
  workflowId: string = '';
  editMode: boolean = false;
  qpSubscription: Subscription;
  mainCanvas: HTMLCanvasElement | null = null;
  mainRect: DOMRect | null = null;
  mainCTX: CanvasRenderingContext2D | null = null;
  canConnect: Array<any> = [];
  nodeWidth: number = 151;
  nodeHeight: number = 48;
  gap: number = 70;
  radius: number = 8;
  nodeConnectorSize = 6;
  currentNodeId: number = 0;
  nodes: Array<Node> = [];
  nodeImage: HTMLImageElement | null = null;

  async ngOnInit() {
    this.setNodeImage();
    await this.getRootObject();
    this.setCanvasSize();
    if (this.editMode) {
      await this.getWorkflowDetails();
    } else {
      this.addRootNode();
    }


    window.requestAnimationFrame(this.animate);
  }

  repeatingChildParent: any = {};
  repeatingChildren: any = {};
  processedChildren: any = [];
  childHeightSet: boolean = false;

  setNodeImage() {
    this.nodeImage = new Image();
    this.nodeImage.src = 'assets/images/component.svg';
  }

  animate = () => {
    if (!this.mainCTX) return;

    this.mainCTX.clearRect((this.mainRect as DOMRect).top, (this.mainRect as DOMRect).left, (this.mainRect as DOMRect).width, (this.mainRect as DOMRect).height);

    if (!this.childHeightSet) {
      this.processedChildren = []
      this.repeatingChildren = {};
      this.setChildHeight(0);
      // console.log(this.nodes.map((n => n.childHeight)))
      this.childHeightSet = true;
    }


    this.nodes[0].coords.x = this.panOffset.x;
    this.nodes[0].coords.y = this.panOffset.y;
    this.draw(this.nodes[0], this.nodes[0].coords.x, this.nodes[0].coords.y);

    this.repeatingChildParent = {};
    window.requestAnimationFrame(this.animate);
  }

  drawConnector(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = '#2C76FF';
    ctx.beginPath();
    ctx.arc(x, y, this.nodeConnectorSize * this.scale, 0, Math.PI * 2, true);
    ctx.fill();
  }

  draw(node: Node, x: number, y: number) {
    if (!this.mainCTX) return;
    this.mainCTX.fillStyle = '#ECECFE';
    this.mainCTX.strokeStyle = '#2C76FF';

    if (this.repeatingChildren[node.id]) {
      let totalChildrenHeight = 0;
      for (let id of this.repeatingChildren[node.id]) {
        let parent = this.nodes.find(n => n.id === id);
        totalChildrenHeight += (parent as Node)?.childHeight || ((this.nodeHeight * this.scale) + (this.gap * this.scale));
      }
      totalChildrenHeight -= (this.gap * this.scale);
      y += (totalChildrenHeight / 2) - (this.nodeHeight * this.scale) / 2;
      this.mainCTX.beginPath();
      this.mainCTX.moveTo(x, y + ((this.nodeHeight * this.scale) / 2));
      this.mainCTX.lineTo(x - ((this.gap * this.scale) / 2), y + ((this.nodeHeight * this.scale) / 2));
      this.mainCTX.lineTo(x - ((this.gap * this.scale) / 2), y - (totalChildrenHeight / 2) + (this.nodeHeight * this.scale));
      this.mainCTX.moveTo(x - ((this.gap * this.scale) / 2), y + ((this.nodeHeight * this.scale) / 2));
      this.mainCTX.lineTo(x - ((this.gap * this.scale) / 2), y + (totalChildrenHeight / 2));
      this.mainCTX.stroke();
      this.mainCTX.closePath();

      this.repeatingChildParent[node.id] = {
        parent: (node as any).parent,
        x: x,
        y: y
      };
    }

    node.coords.x = x;
    node.coords.y = y;
    this.drawNode(node, this.mainCTX);
    node.setButtons(this.scale);

    let totalHeight = 0;
    const children = node.connection.to;
    for (let child of children) {
      let childNode = this.nodes.find(n => n.id == child);
      totalHeight += childNode?.childHeight || (this.gap * this.scale) + (this.nodeHeight * this.scale);
    }

    let startY;
    if (this.repeatingChildren[node.id]) {
      startY = y - (totalHeight / 2);
    } else {
      startY = (node.coords.y - (totalHeight / 2))
    }

    const startX = x + (this.nodeWidth * this.scale) / 2 + (this.gap * this.scale);
    let currentY = startY;

    for (let childId of children) {
      const child = this.nodes.find(n => n.id === childId);
      let childY = currentY;
      if ((child as Node).connection.to.length && this.repeatingChildren[(child as Node).connection.to[0]]) {
        childY += ((this.nodeHeight * this.scale) + (this.gap * this.scale)) / 2
      } else {
        childY += (((child?.childHeight || 0) / 2) || ((this.nodeHeight * this.scale) + (this.gap * this.scale)) / 2)
      }

      const childX = startX + (this.nodeWidth * this.scale) / 2;
      (child as any).parent = node.id;
      if (!(this.repeatingChildren[(child as Node).id] && this.repeatingChildParent[childId])) {
        this.draw(child as Node, childX, childY);
      }
      currentY += (child?.childHeight || ((this.nodeHeight * this.scale) + (this.gap * this.scale)));
      this.mainCTX.beginPath();
      this.mainCTX.moveTo(x + (this.nodeWidth * this.scale), y + ((this.nodeHeight * this.scale) / 2));
      this.mainCTX.lineTo(x + (this.nodeWidth * this.scale) + ((this.gap * this.scale) / 2), y + ((this.nodeHeight * this.scale) / 2));
      this.mainCTX.lineTo(x + (this.nodeWidth * this.scale) + ((this.gap * this.scale) / 2), childY + ((this.nodeHeight * this.scale) / 2));

      this.mainCTX.stroke();
      this.mainCTX.closePath();

      if (!this.repeatingChildren[(child as Node).id]) {
        this.mainCTX.beginPath();
        this.mainCTX.moveTo(x + (this.nodeWidth * this.scale) + ((this.gap * this.scale) / 2), childY + ((this.nodeHeight * this.scale) / 2));
        this.mainCTX.lineTo(childX, childY + ((this.nodeHeight * this.scale) / 2));
        this.mainCTX.stroke();
        this.mainCTX.closePath();
      }
    };

    // for rendering extra state
    if (node.isHovered) {
      node.drawButtons(this.mainCTX, this.scale);
    }

  }

  drawNode(node: Node, ctx: CanvasRenderingContext2D) {
    // ctx.fillRect(node.coords.x, node.coords.y, node.coords.width * this.scale, node.coords.height * this.scale);
    const smallRect = {
      x: node.coords.x,
      y: node.coords.y,
      width: this.nodeHeight * this.scale,
      height: this.nodeHeight * this.scale
    }
    roundedRect(ctx, smallRect, this.radius * this.scale, 'fill', '#F9FAFB', true, false, false, true);
    if (this.nodeImage) {
      const imageSize = smallRect.width / 2;
      const x = smallRect.x + (smallRect.width - imageSize) / 2;
      const y = smallRect.y + (smallRect.height - imageSize) / 2;
      ctx.drawImage((this.nodeImage as HTMLImageElement), x, y, imageSize, imageSize);
    }

    const mainRect = {
      x: node.coords.x + smallRect.width,
      y: node.coords.y,
      width: this.nodeWidth * this.scale - smallRect.width,
      height: this.nodeHeight * this.scale
    }
    roundedRect(ctx, mainRect, this.radius * this.scale, 'fill', '#FFFFFF', false, true, true, false);
    if (node.title) {
      ctx.font = `400 ${14 * this.scale}px Inter`;
      ctx.fillStyle = '#2D2E2E';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.title.toString(), mainRect.x + (8 * this.scale), mainRect.y + (mainRect.height) / 2);
    }

    ctx.save();
    ctx.strokeStyle = '#E4E7EC';
    ctx.beginPath();
    ctx.moveTo(smallRect.x + smallRect.width, smallRect.y);
    ctx.lineTo(smallRect.x + smallRect.width, smallRect.y + smallRect.height);
    ctx.stroke();
    ctx.restore();
    const nodeRect = {
      x: node.coords.x,
      y: node.coords.y,
      width: node.coords.width * this.scale,
      height: node.coords.height * this.scale
    }
    roundedRect(ctx, nodeRect, this.radius * this.scale, 'stroke', '#E4E7EC', true, true, true, true);

    if (node.connection.to.length) {
      this.drawConnector(ctx, node.coords.x + (node.coords.width + this.nodeConnectorSize) * this.scale, node.coords.y + (node.coords.height * this.scale) / 2)
    }
    if (!node.isRoot) {
      this.drawConnector(ctx, node.coords.x - (this.nodeConnectorSize * this.scale), node.coords.y + (node.coords.height * this.scale) / 2)
    }

  }

  setChildHeight(nodeIdx: number) {
    const children = this.nodes[nodeIdx].connection.to;
    let height = 0;
    const nodeId = this.nodes[nodeIdx].id;

    for (let childId of children) {
      const childIdx = this.nodes.findIndex(n => n.id === childId);
      height += this.setChildHeight(childIdx)
    };

    const parents = this.nodes.filter((n: Node) => n.connection.to.includes(nodeId));
    if (parents.length > 1) {
      let baseHeight = 0;
      if (height > (parents.length * ((this.nodeHeight * this.scale) + (this.gap * this.scale)))) {
        baseHeight = (height - ((this.nodeHeight * this.scale) + (this.gap * this.scale))) / (parents.length - 1);
      }

      if (!this.repeatingChildren[this.nodes[nodeIdx].id]) {
        this.repeatingChildren[this.nodes[nodeIdx].id] = [];
      }

      let setHeight = 0;

      this.repeatingChildren[this.nodes[nodeIdx].id].push(parents[this.repeatingChildren[this.nodes[nodeIdx].id].length].id);
      if (this.repeatingChildren[this.nodes[nodeIdx].id].length == parents.length) {
        let parentIndex = parents.findIndex((n: Node) => n.id == this.repeatingChildren[this.nodes[nodeIdx].id][this.repeatingChildren[this.nodes[nodeIdx].id].length - 1])
        parents[parentIndex as any].childHeight = (this.nodeHeight * this.scale) + (this.gap * this.scale);
        setHeight = (this.nodeHeight * this.scale) + (this.gap * this.scale)
      } else {
        parents[this.repeatingChildren[this.nodes[nodeIdx].id].length - 1].childHeight = baseHeight;
        setHeight = baseHeight
      }

      return setHeight;
    }

    this.processedChildren.push(this.nodes[nodeIdx].id);
    this.nodes[nodeIdx].childHeight = height;
    return height || (this.nodeHeight * this.scale) + (this.gap * this.scale);
  }

  addRootNode() {
    const position: ICoordinates = {
      x: 0, //(this.gap * this.scale),
      y: 0, //((this.mainRect as DOMRect).height / 2) - (this.nodeHeight * this.scale) / 2,
      width: this.nodeWidth * this.scale,
      height: this.nodeHeight * this.scale
    };
    const connection: IConnection = {
      connectionType: 'none',
      to: []
    };
    const newNode = new Node(++this.currentNodeId, position, connection, this.scale, true);
    newNode.title = this.canConnect[0].title;
    this.nodes.push(newNode);

    this.panOffset.x = (this.gap * this.scale);
    this.panOffset.y = ((this.mainRect as DOMRect).height / 2) - (this.nodeHeight * this.scale) / 2;
  }


  selectedNodeId: number | null = null;
  addToggler: boolean = false;
  popupPosition: any = {
    left: 10,
    top: 10,
    bottom: 0
  };
  addList: any = [];
  drawerToggler: boolean = false;

  openDrawer(node: Node) {
    if (!node.title) {
      return;
    }
    this.drawerToggler = true;
  }

  onSaveData() {
    const nodes = [];
    for (let node of this.nodes) {
      nodes.push({
        id: node.id,
        app: node.title,
        connection: node.connection
      });
    }
    if (nodes.length == 1) {
      console.log('only root node added');
      return;
    }
    const body = {
      name: this.workflowName,
      nodes: nodes
    };

    if (this.editMode) {
      this._facadeService.workflowService.update(this.workflowId, body).subscribe({
        next: (res: any) => {
          this._facadeService.appService.openToaster('Workflow saved successfully.', 'success');
          this._router.navigateByUrl('/workflow');
        },
        error: (err: any) => {
          this._facadeService.appService.openToaster('Workflow saving failed', 'danger');
        }
      });
    } else {
      this._facadeService.workflowService.create(body).subscribe({
        next: (res: any) => {
          console.log(res);
          this._facadeService.appService.openToaster('Workflow created successfully.', 'success');
          this._router.navigateByUrl('/workflow');
        },
        error: (err: any) => {
          this._facadeService.appService.openToaster('Workflow creation failed.', 'danger');
        }
      });
    }
  }

  onCloseWorkflow() {
    this._router.navigateByUrl('/workflow');
  }

  setPopupPosition(node: Node) {
    setTimeout(() => {
      if ((node.coords.x + (node.coords.width * this.scale) + 250) < innerWidth) {
        this.popupPosition.left = node.coords.x + (node.coords.width * this.scale) + 10;
      } else {
        this.popupPosition.left = node.coords.x - 250;
      }

      if (node.coords.y + 240 < innerHeight) {
        this.popupPosition.top = node.coords.y;
      } else {
        this.popupPosition.top = 'unset';
        this.popupPosition.bottom = innerHeight - node.coords.y - (node.coords.height * this.scale);
      }

      if (this.addPopup) {
        if (this.popupPosition.top !== 'unset') {
          this.addPopup.nativeElement.style.left = `${this.popupPosition.left}px`;
          this.addPopup.nativeElement.style.top = `${this.popupPosition.top}px`;
        } else {
          this.addPopup.nativeElement.style.left = `${this.popupPosition.left}px`;
          this.addPopup.nativeElement.style.bottom = `${this.popupPosition.bottom}px`;
          this.addPopup.nativeElement.style.top = `${this.popupPosition.top}`;
        }
      }
    }, 0);
  }

  onAddNode(option: string) {
    // this.pauseEvent(event);
    if (this.selectedNodeId == null) return;

    const parentNode = this.nodes.find((n: Node) => n.id == this.selectedNodeId);
    if (parentNode) {
      if (option.startsWith('Merge with - ')) {
        const mergedTitle = option.split(' - ')[1];
        const [parentName, title] = mergedTitle.split('/');
        const gp = this.nodes.find((n: Node) => n.connection.to.includes(parentNode.id));
        if (gp) {
          const siblings = this.nodes.filter((n: Node) => gp.connection.to.includes(n.id));
          const siblingParent = siblings.find((n: Node) => n.title == parentName.trim());
          if (siblingParent) {
            const parentIndex = gp.connection.to.indexOf(parentNode.id);

            const siblingParentIndex = gp.connection.to.indexOf(siblingParent.id);
            const childrens = this.nodes.filter((n: Node) => siblingParent.connection.to.includes(n.id));
            const connectedNode = childrens.find((n: Node) => n.title == title.trim());
            if (connectedNode) {
              if (parentIndex < siblingParentIndex) {
                gp.connection.to.splice(parentIndex, 1)
                gp.connection.to.splice(siblingParentIndex - 1, 0, parentNode.id)
              } else {
                gp.connection.to.splice(parentIndex, 1)
                gp.connection.to.splice(siblingParentIndex + 1, 0, parentNode.id)
              }
              parentNode.connection.to.push(connectedNode.id);
            }
          }
        }
        console.log(this.nodes);

      } else {
        const newNode = new Node(++this.currentNodeId, {
          x: 0,
          y: 0,
          width: this.nodeWidth * this.scale,
          height: this.nodeHeight * this.scale
        }, {
          connectionType: 'none',
          to: []
        },
          this.scale);
        newNode.title = option;
        parentNode.connection.to.push(newNode.id);
        this.nodes.push(newNode)
      }
    }

    this.childHeightSet = false;
    this.onClosePopup();
    // setTimeout(() => {
    //   console.log(this.repeatingChildParent);
    //   console.log(this.repeatingChildren)
    // }, 100);
  }

  onDeleteNode(node: Node) {
    if (node.isRoot) {
      return;
    }

    let nodeIds = [node.id, ...node.connection.to];
    this.nodes = this.nodes.filter((n: Node) => !nodeIds.includes(n.id));

    for (let node of this.nodes) {
      node.connection.to = node.connection.to.filter((nodeId: number) => !nodeIds.includes(nodeId));
    }

    this.childHeightSet = false;
    this.repeatingChildren = {};
  }

  onClosePopup() {
    this.selectedNodeId = null;
    this.addToggler = false;
  }


  panStartOffset: IPosition = {
    x: 0,
    y: 0
  };
  panOffset: IPosition = {
    x: 0,
    y: 0
  };
  scale = 1;
  isRightClick: boolean = false;

  @HostListener('window:contextmenu', ['$event'])
  onContextMenu(event: PointerEvent) {
    this.pauseEvent(event);
    if (!this.isRightClick) {
      this.isRightClick = true;
      this.startPanning(event);
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: any) {
    if (this.isRightClick) {
      this.isRightClick = false;
    }
  }

  @HostListener('window:mouseout', ['$event'])
  onMouseOut(event: any) {
    if (this.isRightClick) {
      this.isRightClick = false;
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: any) {
    // console.log(event);

    if (event.ctrlKey) {
      this.onZoom(event);
      return;
    }

  }

  onZoom(event: any) {
    this.isRightClick = false;
    this.panStartOffset = {
      x: 0,
      y: 0
    }

    if (Math.sign(event.wheelDelta) == -1) {
      this.scale *= 1 / 1.1;
      this.panOffset.x = event.offsetX - (event.offsetX - this.panOffset.x) * 1 / 1.1;
      this.panOffset.y = event.offsetY - (event.offsetY - this.panOffset.y) * 1 / 1.1;
    } else {
      this.scale *= 1.1;
      this.panOffset.x = event.offsetX - (event.offsetX - this.panOffset.x) * 1.1;
      this.panOffset.y = event.offsetY - (event.offsetY - this.panOffset.y) * 1.1;
    }
    // this.nodes[0].coords.x = this.panOffset.x;
    // this.nodes[0].coords.y = this.panOffset.y;

    this.childHeightSet = false;

  }

  startPanning(event: PointerEvent) {
    this.panStartOffset = {
      x: event.x,
      y: event.y
    };
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {

    if (this.isRightClick) {
      this.panOffset.x += event.x - this.panStartOffset.x;
      this.panOffset.y += event.y - this.panStartOffset.y;

      this.panStartOffset.x = event.x;
      this.panStartOffset.y = event.y;
      this.nodes[0].coords.x = this.panOffset.x;
      this.nodes[0].coords.y = this.panOffset.y;
      // console.log(this.panOffset)
      return;
    }
    if (this.selectedNodeId == null && this.mainRect) {
      this.setHoverState({ x: event.x - (this.mainRect as DOMRect).left, y: event.y - (this.mainRect as DOMRect).top });
    }
  }

  bufferSize: number = 16;
  setHoverState(cp: IPosition) {
    let bufferSize = this.bufferSize * this.scale;
    for (let node of this.nodes) {
      if (cp.x >= node.coords.x - bufferSize && cp.x <= node.coords.x + bufferSize + (node.coords.width * this.scale) && cp.y >= node.coords.y - bufferSize && cp.y <= node.coords.y + bufferSize + (node.coords.height * this.scale)) {
        node.isHovered = true;
      } else {
        node.isHovered = false;
      }
    }
  }

  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.detailsDrawer && !this.detailsDrawer.nativeElement.contains(event.target)) {
      this.drawerToggler = false;
    }

    const hoveredNode = this.nodes.find((node: Node) => node.isHovered);
    if (hoveredNode) {
      const cp = { x: event.x - (this.mainRect as DOMRect).left, y: event.y - (this.mainRect as DOMRect).top };

      if (cp.x >= hoveredNode.deleteButton.x && cp.x <= hoveredNode.deleteButton.x + hoveredNode.deleteButton.width && cp.y >= hoveredNode.deleteButton.y && cp.y <= hoveredNode.deleteButton.y + hoveredNode.deleteButton.height) {
        this.onDeleteNode(hoveredNode);
        return;
      }
      const addButtonCoords = {
        x: hoveredNode.addButton.x - hoveredNode.addButton.width / 2,
        y: hoveredNode.addButton.y - hoveredNode.addButton.height / 2,
        width: hoveredNode.addButton.width,
        height: hoveredNode.addButton.height
      }
      if (cp.x >= addButtonCoords.x && cp.x <= addButtonCoords.x + addButtonCoords.width && cp.y >= addButtonCoords.y && cp.y <= addButtonCoords.y + addButtonCoords.height) {
        this.addNode(hoveredNode);
        return;
      }
      if (!hoveredNode.isRoot && cp.x >= hoveredNode.coords.x && cp.x <= hoveredNode.coords.x + (hoveredNode.coords.width * this.scale) && cp.y >= hoveredNode.coords.y && cp.y <= hoveredNode.coords.y + (hoveredNode.coords.height * this.scale)) {
        this.openDrawer(hoveredNode);
        return;
      }
    }

    if (this.addPopup && !this.addPopup.nativeElement.contains(event.target)) {
      this.onClosePopup();
    }
  }


  pauseEvent(e: Event) {
    e?.stopPropagation();
    e?.preventDefault();
    return false;
  }

  setCanvasSize() {
    this.mainCanvas = (document.getElementById('mainCanvas') as HTMLCanvasElement);
    if (this.mainCanvas) {
      this.mainCanvas.width = innerWidth;
      this.mainCanvas.height = innerHeight;
      this.mainRect = this.mainCanvas?.getBoundingClientRect() ?? null;
      this.mainCTX = this.mainCanvas?.getContext('2d');
    }
  }

  addNode(node: Node) {
    if (!node?.title) {
      return;
    }

    for (let key of Object.keys(this.repeatingChildren)) {
      if (this.repeatingChildren[key].includes(node.id)) {
        return;
      }
    }

    this.addToggler = true;
    this.selectedNodeId = node.id;

    const connect = this.canConnect.find((d: any) => d.title == node.title);
    this.addList = [];
    if (connect) {
      const siblings = this.nodes.filter((n: Node) => node.connection.to.includes(n.id));
      for (let option of connect.to) {
        const existingNode = siblings.find((n: Node) => n.title == option);
        if (!existingNode) {
          this.addList.push(option)
        }
      }
    }

    if (!node.isRoot) {
      const parentNode = this.nodes.find((n: Node) => n.connection.to.includes(node.id));
      if (parentNode) {
        const siblings = this.nodes.filter((n: Node) => n.id != node.id && parentNode.connection.to.includes(n.id));
        for (let sibling of siblings) {
          if (sibling.connection.to.length == 1 && !this.repeatingChildren[sibling.connection.to[0]]) {
            const siblingChild = this.nodes.find((n: Node) => n.id == sibling.connection.to[0]);

            if (siblingChild && this.addList.includes(siblingChild.title)) {
              this.addList.push(`Merge with - ${sibling.title}/${(siblingChild as Node).title}`)
            }
          }
        }
      }
    }

    this.setPopupPosition(node);
  }

  getRootObject() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.workflowService.getRootObject().subscribe({
        next: (res: any) => {
          if (res.code == 'OK') {
            this.canConnect = res.data;
          }
          resolve();
        },
        error: (err: any) => {
          console.log('There is an error while getting root object', err);
          reject();
        }
      })
    });
  }

  getWorkflowDetails() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.workflowService.getById(this.workflowId).subscribe({
        next: (res: any) => {
          if (res.code == 'OK') {
            this.workflowName = res.data.name;
            this.nodes = [];
            const coords = {
              x: 0,
              y: 0,
              width: this.nodeWidth,
              height: this.nodeHeight
            }
            for (let i = 0; i < res.data.nodes.length; i++) {
              let node = res.data.nodes[i];
              let n = new Node(node.id, { ...coords }, node.connection, this.scale, i ? false : true);
              n.title = node.app;
              this.nodes.push(n);
              if (this.currentNodeId < node.id) {
                this.currentNodeId = node.id
              }
            }

          }
          this.panOffset.x = (this.gap * this.scale);
          this.panOffset.y = ((this.mainRect as DOMRect).height / 2) - (this.nodeHeight * this.scale) / 2;
          resolve();
        },
        error: (err: any) => {
          console.log(err);
          reject();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.qpSubscription?.unsubscribe();
  }
}
