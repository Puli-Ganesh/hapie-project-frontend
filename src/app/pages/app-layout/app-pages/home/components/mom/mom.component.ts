import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';

@Component({
  selector: 'app-mom',
  templateUrl: './mom.component.html',
  styleUrls: ['./mom.component.scss']
})
export class MomComponent implements OnInit {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
    protected _renderer2: Renderer2,
  ) {
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        if (this.projectDetails?._id) {
          this.getRecordingList();
        }
      }
    });
  }

  protected readonly appRoutes = Routes;
  protected isRequestAlive: boolean = false;
  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;
  /** use index based on value.
   * 
   * 0 'Summary', 1 'Action Items', 2 'Sentiment Analysis'
  */
  protected readonly _tabList = ['Summary', 'Action Items', 'Sentiment Analysis'];
  protected selectedTab: string = '';

  protected recordingList: Array<any> = [];
  protected selectedRecording!: any;
  protected selectedSentimentAnalysis!: any;
  protected momData!: any;
  protected _moment = moment;


  ngOnInit(): void {
    this.getMomData();
  }

  onGoBack(event: string) {
    if (event === 'skip' && this.selectedRecording?._id) {
      this.goToRecordingListView();
    }
  }


  getRecordingList() {
    if (!this.projectDetails?._id) {
      this._router.navigateByUrl(this.appRoutes.PROJECTS);
      return;
    }
    this._facadeService.recordingService.list({ projectId: this.projectDetails?._id }).subscribe({
      next: (res: IResponse) => {
        this.recordingList = res.data.list;
      },
      error: (error: any) => {
        console.error('Error while getting recordings', error);
      }
    });
  }

  async onSelectRecording(recording: any) {
    if (recording?._id) {
      this.selectedRecording = recording;
      await this.getMomData();
      this.onSelectTab(this._tabList[0]);
    }
  }

  goToRecordingListView() {
    this.selectedRecording = null;
    this.momData = null;
    this.selectedTab = '';
    this.selectedSentimentAnalysis = null;
  }

  onSelectTab(tab: string) {
    if (this.selectedTab !== tab) {
      this.selectedTab = tab;

      switch (this.selectedTab) {
        case this._tabList[0]:
          setTimeout(() => {
            this.generateHTMLFromString('meeting-summary', this.momData.momSummary);
          }, 10);
          break;
        case this._tabList[1]:
          setTimeout(() => {
            this.generateHTMLFromString('meeting-actions', this.momData.momActionItems);
          }, 10);
          break;
        case this._tabList[2]:
          setTimeout(() => {
            this.setSentimentAnalysisSemiCircleDonutChart();
          }, 10);;
          break;
      }
    }
  }

  async getMomData(): Promise<void> {
    if (!this.selectedRecording?._id) {
      return;
    }
    return await new Promise((resolve, reject) => {
      this._facadeService.recordingService.getMomData(this.selectedRecording?._id).subscribe({
        next: (res: IResponse) => {
          this.momData = res.data;
          console.log('momSummary response \n\n', this.momData.momSummary);
          console.log('momActionItems response \n\n', this.momData.momActionItems);
          resolve();
        },
        error: (error: any) => {
          reject();
          console.error('Error while getting mom data', error);
        }
      });
    });
  }

  generateHTMLFromString(elementId: string, input: string) {
    const contentDiv = document.getElementById(elementId)!;
    this._renderer2.setProperty(contentDiv, 'innerHTML', '');// Clear any existing content

    // Split the input string by new lines
    const lines = input.split('\n');

    let ulElement: any;
    let currentSection = '';
    let currentSubsection = '';

    lines.forEach(line => {
      // Trim leading and trailing spaces
      line = line.trim();

      if (line.startsWith('**') && line.endsWith('**')) {
        // Add previous ulElement if exists
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        // Main sections
        currentSection = line.slice(2, -2);
        const h2 = this._renderer2.createElement('h2');
        h2.textContent = currentSection;
        this._renderer2.appendChild(contentDiv, h2);
      } else if (line.startsWith('- **') && line.includes('**:')) {
        // Add previous ulElement if exists
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        // Subsections
        const subsectionEndIndex = line.indexOf('**:');
        currentSubsection = line.slice(4, subsectionEndIndex);
        const h3 = this._renderer2.createElement('h3');
        h3.textContent = currentSubsection;
        this._renderer2.appendChild(contentDiv, h3);
        ulElement = this._renderer2.createElement('ul');
        if (line.slice(subsectionEndIndex + 3)) {
          const li = this._renderer2.createElement('li');
          li.innerHTML = line.slice(subsectionEndIndex + 3).replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
          this._renderer2.appendChild(ulElement, li);
        }
      } else if (line.startsWith('- **') && line.includes(':**')) {
        // Add previous ulElement if exists
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        // Subsections
        const subsectionEndIndex = line.indexOf(':**');
        currentSubsection = line.slice(4, subsectionEndIndex);
        const h3 = this._renderer2.createElement('h3');
        h3.textContent = currentSubsection;
        this._renderer2.appendChild(contentDiv, h3);
        ulElement = this._renderer2.createElement('ul');
        if (line.slice(subsectionEndIndex + 3)) {
          const li = this._renderer2.createElement('li');
          li.innerHTML = line.slice(subsectionEndIndex + 3).replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
          this._renderer2.appendChild(ulElement, li);
        }
      } else if (line.match(/^\d+\.\s*\*\*(.*?):\*\*/)) {
        // Add previous ulElement if exists
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        // Subsections
        const subsectionMatch = line.match(/^\d+\.\s*\*\*(.*?):\*\*/);
        if (subsectionMatch) {
          currentSubsection = subsectionMatch[1];
          const h3 = this._renderer2.createElement('h3');
          h3.textContent = currentSubsection;
          this._renderer2.appendChild(contentDiv, h3);
          ulElement = this._renderer2.createElement('ul');
          let liLine = line.replace(/^\d+\.\s*\*\*(.*?):\*\*/, '');
          if (liLine) {
            const li = this._renderer2.createElement('li');
            li.innerHTML = liLine.replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
            this._renderer2.appendChild(ulElement, li);
          }
        }
      } else if (line.match(/^\d+\.\s*\*\*(.*?)\*\*:/)) {
        // Add previous ulElement if exists
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        // Subsections
        const subsectionMatch = line.match(/^\d+\.\s*\*\*(.*?)\*\*:/);
        if (subsectionMatch) {
          currentSubsection = subsectionMatch[1];
          const h3 = this._renderer2.createElement('h3');
          h3.textContent = currentSubsection;
          this._renderer2.appendChild(contentDiv, h3);
          ulElement = this._renderer2.createElement('ul');
          let liLine = line.replace(/^\d+\.\s*\*\*(.*?)\*\*:/, '');
          if (liLine) {
            const li = this._renderer2.createElement('li');
            li.innerHTML = liLine.replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
            this._renderer2.appendChild(ulElement, li);
          }
        }
      } else if (line.startsWith('* ') && line.endsWith(':')) {
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        const subsectionEndIndex = line.indexOf(':');
        currentSubsection = line.slice(2, subsectionEndIndex);
        const h3 = this._renderer2.createElement('h3');
        h3.textContent = currentSubsection;
        this._renderer2.appendChild(contentDiv, h3);
        ulElement = this._renderer2.createElement('ul');
      } else if (line.startsWith('*') && line.endsWith('*')) {
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        currentSubsection = line.replace(/\*/g, '');
        const h3 = this._renderer2.createElement('h3');
        h3.textContent = currentSubsection;
        this._renderer2.appendChild(contentDiv, h3);
        ulElement = this._renderer2.createElement('ul');
      } else if (line.startsWith('- ')) {
        if (!ulElement) {
          ulElement = this._renderer2.createElement('ul');
        }
        // Regular list items
        const li = this._renderer2.createElement('li');
        li.innerHTML = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
        this._renderer2.appendChild(ulElement, li);
      } else if (line.match(/^\d+\./)) {
        if (!ulElement) {
          ulElement = this._renderer2.createElement('ul');
        }
        // Numbered list items
        const li = this._renderer2.createElement('li');
        li.innerHTML = line.slice(line.indexOf('.') + 1).trim().replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
        this._renderer2.appendChild(ulElement, li);
      } else if (line.startsWith('- **')) {
        if (!ulElement) {
          ulElement = this._renderer2.createElement('ul');
        }
        // List items with bold text
        const li = this._renderer2.createElement('li');
        li.innerHTML = line.slice(2).replace(/\*\*(.*?)\*\*/, '<span class="bold">$1</span>');
        this._renderer2.appendChild(ulElement, li);
      } else if (line.startsWith('*') && line.endsWith(':*')) {
        // Add previous ulElement if exists
        if (ulElement) {
          this._renderer2.appendChild(contentDiv, ulElement);
          ulElement = null;
        }
        // Subsections
        currentSubsection = line.slice(1, -1);
        const h3 = this._renderer2.createElement('h3');
        h3.textContent = currentSubsection;
        this._renderer2.appendChild(contentDiv, h3);
      } else if (line.startsWith('- ')) {
        if (!ulElement) {
          ulElement = this._renderer2.createElement('ul');
        }
        // Regular list items
        const li = this._renderer2.createElement('li');
        li.innerHTML = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
        this._renderer2.appendChild(ulElement, li);
      } else if (line.startsWith('+ ')) {
        if (!ulElement) {
          ulElement = this._renderer2.createElement('ul');
        }
        // Regular list items
        const li = this._renderer2.createElement('li');
        li.innerHTML = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
        this._renderer2.appendChild(ulElement, li);
      } else if (line.match(/^\d+\./)) {
        if (!ulElement) {
          ulElement = this._renderer2.createElement('ul');
        }
        // Numbered list items
        const li = this._renderer2.createElement('li');
        li.innerHTML = line.slice(line.indexOf('.') + 1).trim().replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>');
        this._renderer2.appendChild(ulElement, li);
      }
    });

    // Append any remaining ulElement
    if (ulElement) {
      this._renderer2.appendChild(contentDiv, ulElement);
    }
  }

  get Highcharts() {
    //@ts-ignore
    return window.Highcharts;
  }

  setSentimentAnalysisSemiCircleDonutChart(): void {
    const data = {
      categories: [],
      series: [{
        type: 'pie',
        name: 'Sentiment Analysis',
        innerSize: '50%',
        data: [
          ['Positive', this.momData.sentimentAnalysis.positivePercentage],
          ['Neutral', this.momData.sentimentAnalysis.neutralPercentage],
          ['Negative', this.momData.sentimentAnalysis.negativePercentage],
        ]
      }]
    };
    // Data retrieved from https://netmarketshare.com/
    this.Highcharts.chart('SentimentAnalysisSemiCircleDonutChart', {
      colors: ['#34A853', '#FBBC05', '#EA4335'],
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false
      },
      title: {
        text: 'Sentiment Analysis',
        align: 'center',
        verticalAlign: 'middle',
        y: 90,
        style: {
          fontSize: '1.1em'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            distance: -50,
            style: {
              fontWeight: 'bold',
              color: 'white'
            }
          },
          startAngle: -90,
          endAngle: 90,
          center: ['50%', '75%'],
          size: '110%',
          cursor: 'pointer',
          events: {
            click: (event: any) => {
              if (event.point.name) {
                this.momData.sentimentAnalysis.pointName = event.point.name;
                this.momData.sentimentAnalysis.selectFrom = `${event.point.name?.toLowerCase()}Points`;
              }
            }
          }
        }
      },
      credits: {
        enabled: false
      },
      series: data.series
    });
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }
}
