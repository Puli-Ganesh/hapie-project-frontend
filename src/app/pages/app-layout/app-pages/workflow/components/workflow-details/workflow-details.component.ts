import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { FacadeService } from '@src/app/services/facade.service';
import { IConnection, ICoordinates, IPosition, Node, roundedRect } from './node';
import { Routes } from '@src/app/constants/routes';

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
    const state = this._router.getCurrentNavigation()?.extras.state;
    this.isCreating = state?.['isCreating'] ?? false;
  }

  @ViewChild('addPopup') addPopup!: ElementRef;
  @ViewChild('detailsDrawer') detailsDrawer!: ElementRef;

  workflowName: string = '';
  workflowId: string = '';
  qpSubscription!: Subscription;
  appRoutes = Routes;
  mainCanvas: HTMLCanvasElement | null = null;
  mainRect: DOMRect | null = null;
  mainCTX: CanvasRenderingContext2D | null = null;
  canConnect: Array<any> = [];
  nodeWidth: number = 100;
  nodeHeight: number = 87;
  gap: number = 78;
  radius: number = 8;
  nodeConnectorSize = 6;
  currentNodeId: number = 0;
  nodes: Array<Node> = [];
  nodeImages: any = {};
  documentTitle = '';
  isCreating = false;
  animationId: any;

  async ngOnInit() {
    await this.getRootObject();
    // await this.getTemplatesList();
    this.setNodeImage();
    this.setCanvasSize();

    this.qpSubscription = this._activatedRoute.params.subscribe({
      next: async (params: Params) => {
        if (params && params['workflowId']) {
          this.workflowId = params['workflowId'];
          await this.getWorkflowDetails();
          // if (this.workflowId && params['workflowId'] != this.workflowId) {
          //   this.workflowId = params['workflowId'];
          // } else {
          //   this.getWorkflowDetails();
          // }
        }
      }
    });

    // await this.getWorkflowDetails();

    // window.requestAnimationFrame(this.animate);
  }

  repeatingChildParent: any = {};
  repeatingChildren: any = {};
  processedChildren: any = [];
  childHeightSet: boolean = false;

  setNodeImage() {
    for (let item of this.canConnect) {
      this.nodeImages[item.title] = new Image();
      let src = '';
      switch (item.title) {
        case 'Start':
          src = 'start.svg';
          break;
        case 'Teams':
          src = 'teams.svg';
          break;
        case 'Zoom':
          src = 'zoom.svg';
          break;
        case 'Meet':
          src = 'meet.svg';
          break;
        case 'Video Upload':
          src = 'video-upload.svg';
          break;
        case 'Analysis':
          src = 'analysis.svg';
          break;
        case 'AI':
          src = 'ai.svg';
          break;
        case 'Compare Video':
          src = 'compare-video.svg';
          break;
        case 'Canvas':
          src = 'canvas.svg';
          break;
        case 'Document':
          src = 'document.svg';
          break;
        case 'Pandadoc':
          src = 'pandadoc.svg';
          break;
        case 'Email':
          src = 'email.svg';
          break;
        case 'Slack':
          src = 'slack.svg';
          break;
        case 'Audio App':
          src = 'audio-app.svg';
          break;
        case 'Chat Bot':
          src = 'chat-bot.svg';
          break;
        case 'Document Upload':
          src = 'document-upload.svg';
          break;
        case 'Image':
          src = 'image.svg';
          break;
        case 'Hangouts':
          src = 'hangouts.svg';
          break;
        case 'Google Chat':
          src = 'google-chat.svg';
          break;
        case 'Machine Learning':
          src = 'machine-learning.svg';
          break;
        case 'Salesforce':
          src = 'salesforce.svg';
          break;
        case 'Video App':
          src = 'video-app.svg';
          break;
        case 'Jenkins':
          src = 'jenkins.svg';
          break;
        case 'Adobe Marketing Cloud':
          src = 'adobe-marketing-cloud.svg';
          break;
        case 'Asana':
          src = 'asana.svg';
          break;
        case 'AWS':
          src = 'aws.svg';
          break;
        case 'Azure Devops':
          src = 'azure-devops.svg';
          break;
        case 'BambooHR':
          src = 'bamboo-hr.svg';
          break;
        case 'Bitbucket':
          src = 'bitbucket.svg';
          break;
        case 'Bitbucket Agent':
          src = 'bitbucket-agent.svg';
          break;
        case 'CircleCI':
          src = 'circleci.svg';
          break;
        case 'Code Climate':
          src = 'code-climate.svg';
          break;
        case 'Confluence':
          src = 'confluence.svg';
          break;
        case 'Confluence Agent':
          src = 'confluence-agent.svg';
          break;
        case 'Crowdstrike':
          src = 'crowdstrike.svg';
          break;
        case 'GitHub':
          src = 'github.svg';
          break;
        case 'GitLab':
          src = 'gitlab.svg';
          break;
        case 'Google Analytics':
          src = 'google-analytics.svg';
          break;
        case 'Google Cloud Platform':
          src = 'google-cloud-platform.svg';
          break;
        case 'Google Workspace':
          src = 'google-workspace.svg';
          break;
        case 'HubSpot CRM':
          src = 'hubspot-crm.svg';
          break;
        case 'Jira':
          src = 'jira.svg';
          break;
        case 'Jira Agent':
          src = 'jira-agent.svg';
          break;
        case 'Mailchimp':
          src = 'mailchimp.svg';
          break;
        case 'Marketo':
          src = 'marketo.svg';
          break;
        case 'Microsoft 365':
          src = 'microsoft-365.svg';
          break;
        case 'Microsoft Azure':
          src = 'microsoft-azure.svg';
          break;
        case 'Microsoft Dynamic 365':
          src = 'microsoft-dynamic-365.svg';
          break;
        case 'Microsoft Dynamic AX':
          src = 'microsoft-dynamic-ax.svg';
          break;
        case 'Microsoft':
          src = 'microsoft.svg';
          break;
        case 'Monday':
          src = 'monday.svg';
          break;
        case 'OKTA':
          src = 'okta.svg';
          break;
        case 'Oracle ERP Cloud':
          src = 'oracle-erp-cloud.svg';
          break;
        case 'Palo Alto Network':
          src = 'palo-alto-network.svg';
          break;
        case 'Power BI':
          src = 'power-bi.svg';
          break;
        case 'Sap S/4HANA':
          src = 'sap-s-4hana.svg';
          break;
        case 'Sap SuccessFactors':
          src = 'sap-success-factors.svg';
          break;
        case 'SonarQube':
          src = 'sonarqube.svg';
          break;
        case 'Tableau':
          src = 'tableau.svg';
          break;
        case 'Trello':
          src = 'trello.svg';
          break;
        case 'Workday':
          src = 'workday.svg';
          break;
        case 'Super Agent (AI)':
          src = 'super-agent-ai.png';
          break;
        case 'Vector Database':
          src = 'vector-database.png';
          break;
        default:
          break;
      }

      if (src) {
        this.nodeImages[item.title].src = `assets/images/${src}`;
      }
    }

    console.log(this.nodeImages)
  }


  onDetailsSave() {
    const node = this.nodes.find((n: Node) => n.id == this.selectedNodeId);
    if (node) {
      node.config.documentTitle = this.documentTitle.trim();
    }
    this.onDetailsCancel();
  }

  onDetailsCancel() {
    this.selectedNodeId = null;
    this.drawerToggler = false;
  }

  animate = () => {
    if (!this.mainCTX) return;

    this.mainCTX.clearRect(0, 0, (this.mainRect as DOMRect).width, (this.mainRect as DOMRect).height);

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

  /**
   * @description: wrapText wraps HTML canvas text onto a canvas of fixed width
   * @param ctx - the context for the canvas we want to wrap text on
   * @param text - the text we want to wrap.
   * @param x - the X starting point of the text on the canvas.
   * @param y - the Y starting point of the text on the canvas.
   * @param maxWidth - the width at which we want line breaks to begin - i.e. the maximum width of the canvas.
   * @param lineHeight - the height of each line, so we can space them below each other.
   * @returns an array of [ lineText, x, y ] for all lines
   */
  wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    // First, start by splitting all of our text into words, but splitting it into an array split by spaces
    let words = text.split(' ');
    let line = ''; // This will store the text of the current line
    let testLine = ''; // This will store the text when we add a word, to test if it's too long
    let lineArray = []; // This is an array of lines, which the function will return

    // Lets iterate over each word
    for (var n = 0; n < words.length; n++) {
      // Create a test line, and measure it..
      testLine += `${words[n]} `;
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      // If the width of this test line is more than the max width
      if (testWidth > maxWidth && n > 0) {
        // Then the line is finished, push the current line into "lineArray"
        lineArray.push([line, x, y]);
        // Increase the line height, so a new line is started
        y += lineHeight;
        // Update line and test line to use this word as the first word on the next line
        line = `${words[n]} `;
        testLine = `${words[n]} `;
      } else {
        // If the test line is still less than the max width, then add the word to the current line
        line += `${words[n]} `;
      }
      // If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
      if (n === words.length - 1) {
        lineArray.push([line, x, y]);
      }
    }
    // Return the line array
    return lineArray;
  }

   drawNode(node: Node, ctx: CanvasRenderingContext2D) {
    const mainRect = {
      x: node.coords.x,
      y: node.coords.y,
      height: node.coords.height * this.scale,
      width: node.coords.width * this.scale
    }
    const imageRect = {
      x: node.coords.x,
      y: node.coords.y,
      width: node.coords.width * this.scale,
      height: 64 * this.scale
    }
    
    roundedRect(ctx, imageRect, this.radius * this.scale, 'fill', '#F9FAFB', true, true, false, false);
    roundedRect(ctx, mainRect, this.radius * this.scale, 'stroke', '#E4E7EC', true, true, true, true);

    if (this.nodeImages[node.title]) {
      const imageSize = 48 * this.scale;
      let image = this.nodeImages[node.title] as HTMLImageElement;
      ctx.drawImage(image, imageRect.x + imageRect.width / 2 - imageSize / 2, imageRect.y + imageRect.height / 2 - imageSize / 2, imageSize, imageSize);
    }


    ctx.save();
    ctx.strokeStyle = '#E4E7EC';
    ctx.beginPath();
    ctx.moveTo(imageRect.x, imageRect.y + imageRect.height);
    ctx.lineTo(imageRect.x + imageRect.width, imageRect.y + imageRect.height);
    ctx.stroke();
    ctx.restore();

    let title = node.title;

    if (node?.config?.documentTitle) {
      if (node.config.documentTitle.length > 14) {
        title = `${node.config.documentTitle.substr(0, 11)}...`
      } else {
        title = node.config.documentTitle;
      }
      // ctx.fillText(node.config.documentTitle.toString(), mainRect.x + (8 * this.scale), mainRect.y + (mainRect.height) / 2);
      // let wrappedText: any = this.wrapText(ctx, node.config.documentTitle.toString(), rect.x + rect.width / 2, rect.y + (26 * this.scale) + (rect.height) / 2, rect.width, 14 * this.scale);
      // wrappedText.splice(3);
      // for (let i = 0; i < wrappedText.length; i++) {
      //   const line = wrappedText[i];
      //   if (i > 2) break;
      //   switch (wrappedText.length) {
      //     case 1:
      //       ctx.fillText(line[0], line[1], line[2]);
      //       break;
      //     case 2:
      //       ctx.fillText(line[0], line[1], (line[2] - ((14 * this.scale) / 2)));
      //       break;
      //     default:
      //       ctx.fillText(line[0], line[1], (line[2] - ((14 * this.scale) / 2)));
      //       break;
      //   }
      // }
    }
    ctx.font = `400 ${12 * this.scale}px Inter`;
    ctx.fillStyle = '#2D2E2E';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center'
    ctx.fillText(title, imageRect.x + imageRect.width / 2, imageRect.y + imageRect.height + (11.5 * this.scale));

    const nodeRect = {
      x: node.coords.x,
      y: node.coords.y,
      width: node.coords.width * this.scale,
      height: node.coords.height * this.scale
    };
    // roundedRect(ctx, nodeRect, this.radius * this.scale, 'stroke', '#E4E7EC', true, true, true, true);

    if (node.connection.to.length) {
      this.drawConnector(ctx, node.coords.x + (node.coords.width + this.nodeConnectorSize) * this.scale, node.coords.y + (node.coords.height * this.scale) / 2);
    }
    if (!node.isRoot) {
      this.drawConnector(ctx, node.coords.x - (this.nodeConnectorSize * this.scale), node.coords.y + (node.coords.height * this.scale) / 2);
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
    // console.log('node index', this.nodes[nodeIdx].id)

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
      if (this.repeatingChildren[this.nodes[nodeIdx].id].length != parents.length) {
        this.repeatingChildren[this.nodes[nodeIdx].id].push(parents[this.repeatingChildren[this.nodes[nodeIdx].id].length].id);
      }

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
    bottom: 0,
    right: 0,
  };
  addList: any = [];
  filteredAddList: any = [];
  drawerToggler: boolean = false;

  openDrawer(node: Node) {
    if (!node.title) {
      return;
    }
    this.selectedNodeId = node.id;
    if (node?.config?.documentTitle) {
      this.documentTitle = node.config.documentTitle;
    }
    this.drawerToggler = true;
  }

  onSaveData() {
    // if (!this.isCreating) return;
    const nodes = [];
    for (let node of this.nodes) {
      const n: any = {
        id: node.id,
        app: node.title,
        connection: node.connection
      }
      if (Object.keys(node.config).length) {
        n['config'] = node.config
      }
      nodes.push(n);
    }
    const body = {
      name: this.workflowName,
      nodes: nodes
    };

    this._facadeService.workflowService.update(this.workflowId, body).subscribe({
      next: (res: any) => {
        this._facadeService.appService.openToaster('Workflow saved successfully.', 'success');
        this.onExit();
      },
      error: (err: any) => {
        this._facadeService.appService.openToaster('Workflow saving failed', 'danger');
      }
    });
  }

  onExit() {
    this._router.navigate([this.appRoutes.WORKFLOWS]);
  }

  setPopupPosition(node: Node) {
    const popupWidth = 350;
    const gap = 20;
    const popupHeight = 205;
    setTimeout(() => {
      this.popupPosition = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
      if ((node.coords.x + (node.coords.width) + popupWidth + gap) < (this.mainRect as DOMRect).width) {
        this.popupPosition.left = (this.mainRect as DOMRect).x + node.coords.x + (node.coords.width * this.scale) + 20;
      } else {
        this.popupPosition.right = innerWidth - (this.mainRect as DOMRect).x - node.coords.x + gap;
      }

      if (node.coords.y + (node.coords.height * this.scale) + popupHeight + gap < (this.mainRect as DOMRect).height) {
        this.popupPosition.top = (this.mainRect as DOMRect).top + node.coords.y;
      } else {
        this.popupPosition.bottom = innerHeight - (this.mainRect as DOMRect).top - node.coords.y;
      }

      for (let key of Object.keys(this.popupPosition)) {
        this.addPopup.nativeElement.style[key] = this.popupPosition[key] ? `${this.popupPosition[key]}px` : 'unset';
      }
      // if (this.addPopup) {
      //   if (this.popupPosition.top !== 'unset') {
      //     this.addPopup.nativeElement.style.left = `${this.popupPosition.left}px`;
      //     this.addPopup.nativeElement.style.top = `${this.popupPosition.top}px`;
      //   } else {
      //     this.addPopup.nativeElement.style.left = `${this.popupPosition.left}px`;
      //     this.addPopup.nativeElement.style.bottom = `${this.popupPosition.bottom}px`;
      //     this.addPopup.nativeElement.style.top = `${this.popupPosition.top}`;
      //   }
      // }
    }, 0);
  }

  onAddNode(option: any) {
    // this.pauseEvent(event);
    if (this.selectedNodeId == null) return;

    const parentNode = this.nodes.find((n: Node) => n.id == this.selectedNodeId);
    if (parentNode) {
      if (option.title.startsWith('Merge with - ')) {
        const mergingNodeId = option.nodeId;
        const mergedTitle = option.title.split(' - ')[1];
        const [parentName, title] = mergedTitle.split('/');
        const gp = this.nodes.find((n: Node) => n.connection.to.includes(parentNode.id));
        if (gp) {
          const siblings = this.nodes.filter((n: Node) => gp.connection.to.includes(n.id) && n.connection.to.includes(mergingNodeId));
          
          if (!siblings.length) return;
          const siblingParent = siblings[0];

          const parentIndex = gp.connection.to.indexOf(parentNode.id);
          const siblingParentIndex = gp.connection.to.indexOf(siblingParent.id);

          if (parentIndex < siblingParentIndex) {
            gp.connection.to.splice(parentIndex, 1)
            gp.connection.to.splice(siblingParentIndex - 1, 0, parentNode.id)
          } else {
            gp.connection.to.splice(parentIndex, 1)
            gp.connection.to.splice(siblingParentIndex + 1, 0, parentNode.id)
          }
          parentNode.connection.to.push(mergingNodeId);
        }

      } else {
        const newNode = new Node(++this.currentNodeId, {
          x: 0,
          y: 0,
          width: this.nodeWidth,
          height: this.nodeHeight
        }, {
          connectionType: 'none',    
          to: []
        },
          this.scale);
        newNode.title = option.title;
        parentNode.connection.to.push(newNode.id);
        this.nodes.push(newNode);
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

    const childIds = this.getChildIds(node);
    let nodeIds = [node.id, ...childIds];
    this.nodes = this.nodes.filter((n: Node) => !nodeIds.includes(n.id));

    for (let node of this.nodes) {
      node.connection.to = node.connection.to.filter((nodeId: number) => !nodeIds.includes(nodeId));
    }

    this.childHeightSet = false;
    this.repeatingChildren = {};
  }

  getChildIds(node: Node): number[] {
    if (!node.connection.to.length) {
      return [];
    }
    let arr: number[] = [...node.connection.to];
    for (let childId of node.connection.to) {
      const childNode = this.nodes.find((n: Node) => n.id == childId);
      arr.push(...this.getChildIds(childNode as Node));
    }
    return arr;
  }

  onClosePopup() {
    this.selectedNodeId = null;
    this.addToggler = false;
    this.addList = [];
    this.filteredAddList = [];
    this.searchTerm = '';
  }

  protected searchTerm: string = '';
  onSearchOption() {
    console.log(this.searchTerm);
    this.filteredAddList = this.addList.filter((op: any) => op.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
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

      const deleteButtonCoords = {
        x: hoveredNode.deleteButton.x - hoveredNode.deleteButton.width / 2,
        y: hoveredNode.deleteButton.y - hoveredNode.deleteButton.height / 2,
        width: hoveredNode.deleteButton.width,
        height: hoveredNode.deleteButton.height
      }
      if (cp.x >= deleteButtonCoords.x && cp.x <= deleteButtonCoords.x + deleteButtonCoords.width && cp.y >= deleteButtonCoords.y && cp.y <= deleteButtonCoords.y + deleteButtonCoords.height) {
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
      if (!hoveredNode.isRoot && hoveredNode.title == 'Document') {
        if (cp.x >= hoveredNode.coords.x && cp.x <= hoveredNode.coords.x + (hoveredNode.coords.width * this.scale) && cp.y >= hoveredNode.coords.y && cp.y <= hoveredNode.coords.y + (hoveredNode.coords.height * this.scale)) {
          this.openDrawer(hoveredNode);
          return;
        }
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
    const wrapper = document.getElementById('mainCanvasWrapper');
    if (!wrapper) {
      console.log('No main wrapper found');
      return;
    }
    this.mainCanvas = (document.getElementById('mainCanvas') as HTMLCanvasElement);
    if (this.mainCanvas) {
      const wrapperRect = wrapper.getBoundingClientRect();
      this.mainCanvas.width = wrapperRect.width;
      this.mainCanvas.height = wrapperRect.height;
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

    this.addList = this.canConnect.reduce((ac, cv) => {
      if (cv.title === 'Start') {
        return ac;
      }
      if (this.nodeImages[cv.title]) {
        ac.push({
          title: cv.title,
          src: this.nodeImages[cv.title].src.split('/images/').pop()
        });
      } else {
        ac.push({
          title: cv.title
        });
      }
      return ac;
    }, []);

    // const connect = this.canConnect.find((d: any) => d.title == node.title);
    // this.addList = [];

    // if (connect) {
    //   for (let item of connect.to) {
    //     this.addList.push({
    //       title: item
    //     });
    //   }
    //   // this.addList = [...connect.to];
    //   // const siblings = this.nodes.filter((n: Node) => node.connection.to.includes(n.id));
    //   // for (let option of connect.to) {
    //   //   const existingNode = siblings.find((n: Node) => n.title == option);
    //   //   if (!existingNode) {
    //   //     this.addList.push(option)
    //   //   }
    //   // }
    // }

    if (!node.isRoot && !node.connection.to.length) {
      const parentNode = this.nodes.find((n: Node) => n.connection.to.includes(node.id));
      if (parentNode) {
        const siblings = this.nodes.filter((n: Node) => n.id != node.id && parentNode.connection.to.includes(n.id) && n.connection.to.length == 1);
        console.log(JSON.parse(JSON.stringify(siblings)))

        for (let sibling of siblings) {
          const siblingChild = this.nodes.find((n: Node) => n.id == sibling.connection.to[0]);
          if (!siblingChild) continue;

          const mergingSiblings = siblings.filter((n: Node) => n.connection.to.includes(siblingChild.id));
          if (mergingSiblings.length > 1) {
            let groupName = '';
            for (let z = 0; z < mergingSiblings.length; z++) {
              let mSibling = mergingSiblings[z];
              groupName += z == (mergingSiblings.length - 1) ? mSibling.title : `${mSibling.title}, `;
              const index = siblings.indexOf(mSibling);
              if (index > -1) {
                siblings.splice(index, 1);
              }
            }
            this.addList.push({
              title: `Merge with - ${groupName}/${(siblingChild as Node).title}`,
              nodeId: siblingChild.id
            });
          } else {
            this.addList.push({
              title: `Merge with - ${sibling.title}/${(siblingChild as Node).title}`,
              nodeId: siblingChild.id
            });
          }
        }
      }
    }

    this.filteredAddList = [...this.addList];

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
            console.log(res.data)
            this.workflowName = res.data.name;
            this.nodes = [];
            const coords = {
              x: 0,
              y: 0,
              width: this.nodeWidth,
              height: this.nodeHeight
            };
            for (let i = 0; i < res.data.nodes.length; i++) {
              let node = res.data.nodes[i];
              if (i == 12) {
                node.connection.to.push(14);
              }
              let n = new Node(node.id, { ...coords }, node.connection, this.scale, i ? false : true);
              if (node?.config?.documentTitle) {
                n.config['documentTitle'] = node.config.documentTitle;
              }
              n.title = node.app;
              this.nodes.push(n);
              if (this.currentNodeId < node.id) {
                this.currentNodeId = node.id;
              }
            }

          }
          this.panOffset.x = (this.gap * this.scale);
          this.panOffset.y = ((this.mainRect as DOMRect).height / 2) - (this.nodeHeight * this.scale) / 2;

          this.scale = 1;
          this.panStartOffset = {
            x: 0,
            y: 0
          };
          this.childHeightSet = false;
          this.processedChildren = [];
          this.repeatingChildParent = {};
          this.repeatingChildren = {};

          if (this.animationId) {
            window.cancelAnimationFrame(this.animationId);
          }
          console.log(this.nodes)
          this.animationId = window.requestAnimationFrame(this.animate);

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
