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
          const meetingSummarySections = this.formatMeetingSummary(this.momData.momSummary);
          setTimeout(() => {
            const meetingSummaryContainer = document.getElementById('meeting-summary');
            if (meetingSummaryContainer) {
              meetingSummarySections.forEach(section => {
                this._renderer2.appendChild(meetingSummaryContainer, section);
              });
            }
          }, 10);
          break;
        case this._tabList[1]:
          const meetingActionsSections = this.formatMeetingSummary(this.momData.momActionItems);
          setTimeout(() => {
            const meetingActionsContainer = document.getElementById('meeting-actions');
            if (meetingActionsContainer) {
              meetingActionsSections.forEach(section => {
                this._renderer2.appendChild(meetingActionsContainer, section);
              });
            }
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

  formatMeetingSummary(inputString: string) {
    const parts = inputString.split("**");
    const sections = [];

    for (let i = 1; i < parts.length; i += 2) {
      const heading = parts[i].trim();
      const content = parts[i + 1].trim().replace(/\n/g, '');

      const section = this._renderer2.createElement('div');
      this._renderer2.addClass(section, 'meeting-section');

      const headingElement = this._renderer2.createElement('h2');
      this._renderer2.setProperty(headingElement, 'textContent', heading);
      this._renderer2.appendChild(section, headingElement);

      const ul = this._renderer2.createElement('ul');
      content.split(/\d+\. +|\- +|\+ +/).forEach(item => {
        if (item.trim() !== '' && item.trim() !== '-') {
          const li = this._renderer2.createElement('li');
          this._renderer2.setProperty(li, 'innerHTML', item.trim().replace(/( *\- *| *\+ *)$/, ''));
          this._renderer2.appendChild(ul, li);
        }
      });

      this._renderer2.appendChild(section, ul);
      sections.push(section);
    }

    return sections;
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
