import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { Subscription } from 'rxjs';

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


  ngOnInit(): void {
    this.setSentimentByRatingChat();
  }

  onGoBack() {
    this._router.navigateByUrl(this.appRoutes.PROJECTS);
  }

  onExit() {
    this._router.navigateByUrl(this.appRoutes.PROJECTS);
  }

  get Highcharts() {
    //@ts-ignore
    return window.Highcharts;
  }

  setSentimentByRatingChat(): void {
    this.sentimentByRatingChartData.categories = ['Label 1', 'Label 2', 'Label 3', 'Label 4'];
    this.sentimentByRatingChartData.series = [{
      name: 'Title 1',
      color: 'red',
      data: [30, 50, 10, 130]
    }, {
      name: 'Title 2',
      color: 'orange',
      data: [140, 80, 80, 120]
    }, {
      name: 'Title 3',
      color: 'green',
      data: [0, 20, 60, 30]
    }];

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
        min: 0,
        title: {
          text: ''
          // text: 'left side Y axis title'
        },
        stackLabels: {
          enabled: !true
        }
      },
      legend: {
        align: 'left',
        x: 70,
        verticalAlign: 'top',
        y: 30,
        floating: true,
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
