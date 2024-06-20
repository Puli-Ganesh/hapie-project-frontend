import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
  ) {
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        if (this.projectDetails) {
          this.getData();
        }
      }
    });
  }

  protected readonly appRoutes = Routes;
  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;
  protected sentimentByRatingChartData: any = {
    series: [],
    categories: []
  };


  ngOnInit(): void { }

  getData() {
    if (!this.projectDetails?._id) {
      return;
    }

    this._facadeService.dashboardService.getData(this.projectDetails._id).subscribe({
      next: (res: IResponse) => {
        if (res.code === 'OK') {
          this.setSentimentByRatingChat(res.data.sentimentChartData);
        }
      },
      error: (err: any) => {
        console.log('Error while getting data', err.error);
      }
    });
  }

  get Highcharts() {
    //@ts-ignore
    return window.Highcharts;
  }

  setSentimentByRatingChat(data: Array<any>): void {
    this.sentimentByRatingChartData.categories = [];
    this.sentimentByRatingChartData.series = [{
      name: 'Negative',
      color: '#EA4335',
      data: []
    }, {
      name: 'Neutral',
      color: '#FBBC05',
      data: []
    }, {
      name: 'Positive',
      color: '#34A853',
      data: []
    }];
    for (const recording of data) {
      this.sentimentByRatingChartData.categories.push(moment(recording.createdAt).format('Do MMM, [At] h:mm a'));
      this.sentimentByRatingChartData.series[0].data.push(recording?.sentimentAnalysis?.negativePercentage ?? 0);
      this.sentimentByRatingChartData.series[1].data.push(recording?.sentimentAnalysis?.neutralPercentage ?? 0);
      this.sentimentByRatingChartData.series[2].data.push(recording?.sentimentAnalysis?.positivePercentage ?? 0);
    }

    this.Highcharts.chart('sentimentByRatingChart', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Sentiment by Rating',
        align: 'left',
      },
      xAxis: {
        categories: this.sentimentByRatingChartData.categories
      },
      yAxis: {
        title: {
          text: ''
          // text: 'left side Y axis title'
        },
        min: 0,
        max: 100,
        // tickInterval: 20,
        stackLabels: {
          enabled: !true
        },
        labels: {
          format: '{value}%'
        }
      },
      legend: {
        align: 'left',
        x: 35,
        verticalAlign: 'top',
        y: 0,
        floating: !true,
        backgroundColor: this.Highcharts.defaultOptions.legend.backgroundColor || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: !true
          }
        }
      },
      credits: {
        enabled: false
      },
      series: this.sentimentByRatingChartData.series
    });
  }


  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }
}
