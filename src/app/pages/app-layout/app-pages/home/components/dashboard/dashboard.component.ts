import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';


type TCalendarPlatform = 'teams' | 'zoom' | 'meet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
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

    this.isMicrosoftUser = this._facadeService.appService.isMicrosoftUser;
  }

  protected readonly appRoutes = Routes;
  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;
  protected sentimentByRatingChartData: any = {
    series: [],
    categories: []
  };

  protected isMicrosoftUser: boolean = false;
  protected calendar: Array<Array<{ day: number, date: moment.Moment, isCurrentMonth: boolean }>> = [];
  protected currentDate!: moment.Moment;
  protected toDayDate: moment.Moment = moment();
  protected selectedDate!: moment.Moment;
  protected calendarMeetingDetailsObj: { [key: string]: Array<any> } = {};
  protected meetingListOfSelectedDate!: any;


  ngOnInit(): void {
    // if (this.isMicrosoftUser) {
    //   this.currentDate = moment();
    //   this.selectedDate = this.currentDate.clone();
    //   this.generateCalendar();
    // }
    this.currentDate = moment();
    this.selectedDate = this.currentDate.clone();
    this.generateCalendar();
  }

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

  generateCalendar(): void {
    const startOfMonth = moment(this.currentDate).startOf('month');
    const endOfMonth = moment(this.currentDate).endOf('month').startOf('day');
    const firstDayOfWeek = startOfMonth.day();
    const daysInMonth = endOfMonth.date();
    const weeks: any[] = [];

    let day = 1;
    let week: any[] = [];

    /** Fill in the first week */
    const previousMonth = moment(startOfMonth).subtract(1, 'month');
    const previousMonthDays = previousMonth.daysInMonth();
    let previousMonthDay = previousMonthDays - firstDayOfWeek + 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push({
        day: previousMonthDay,
        date: previousMonth.clone().set({ date: previousMonthDay }),
        isCurrentMonth: false
      });
      previousMonthDay++;
    }

    while (day <= daysInMonth) {
      week.push({
        day: day,
        date: startOfMonth.clone().set({ date: day }),
        isCurrentMonth: true
      });
      day++;

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    /** Fill in the last week */
    if (week.length > 0) {
      let nextMonthDay = 1;
      const nextMonth = moment(endOfMonth).add(1, 'day');
      while (week.length < 7) {
        week.push({
          day: nextMonthDay,
          date: nextMonth.clone().set({ date: nextMonthDay }),
          isCurrentMonth: false
        });
        nextMonthDay++;
      }
      weeks.push(week);
    }

    this.calendar = weeks;
    this.getCalendarData();
  }

  previousMonth(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'month');
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = moment(this.currentDate).add(1, 'month');
    this.generateCalendar();
  }

  today(): void {
    this.currentDate = moment();
    this.selectedDate = this.currentDate.clone();
    this.meetingListOfSelectedDate = [];
    this.generateCalendar();
  }

  protected isCalendarRequestAlive: boolean = false;
  getCalendarData() {
    if (this.isCalendarRequestAlive) { return; }

    if (!this.calendar?.length) {
      this.isCalendarRefreshing = false;
      return;
    }

    const body = {
      startDate: moment(this.currentDate).startOf('month').format(),
      endDate: moment(this.currentDate).endOf('month').startOf('day').format()
    };

    this.isCalendarRequestAlive = true;
    this._facadeService.dashboardService.getCalendarData(body).subscribe({
      next: (res: IResponse) => {
        this.isCalendarRequestAlive = false;
        this.isCalendarRefreshing = false;
        if (res.code === "OK") {
          if (res.data?.eventList?.length > 0) {
            this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')] = res.data.eventList ?? [];

            this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')].map((item) => {
              item.startTime = moment(item.startDateTime);
              item.endTime = moment(item.endDateTime);
              item.isEnded = item.endTime.isBefore(moment());
              return item;
            });
            this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')].sort((a: any, b: any) => a.startTime - b.startTime);

            const singleDateList = this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')]?.filter((item: any) => item.startTime.format('YYYY-MM-DD') === this.selectedDate.format('YYYY-MM-DD'));
            this.meetingListOfSelectedDate = singleDateList;
          }
        }
      },
      error: (err: any) => {
        this.isCalendarRequestAlive = false;
        this.isCalendarRefreshing = false;
        console.log('Error while getting calendar data', err);
      }
    });
  }

  protected isCalendarRefreshing: boolean = false;
  onRefreshCalendar(): void {
    if (this.isCalendarRefreshing) {
      return;
    }
    this.isCalendarRefreshing = true;
    this.meetingListOfSelectedDate = [];

    this.getCalendarData();
  }

  onSelectDate(weekIndex: number, dayIndex: number) {
    if (this.isCalendarRequestAlive) { return; }

    const selectedDate = this.calendar[weekIndex][dayIndex];
    if (selectedDate.isCurrentMonth) {
      this.selectedDate = this.calendar[weekIndex][dayIndex].date.clone();
      const singleDateList = this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')]?.filter((item: any) => item.startTime.format('YYYY-MM-DD') === this.selectedDate.format('YYYY-MM-DD'));
      this.meetingListOfSelectedDate = singleDateList.map((event: any) => ({ ...event, isEnded: event.endTime.isBefore(moment()) }));
    } else if (selectedDate.isCurrentMonth === false && weekIndex === 0) {
      this.selectedDate = this.calendar[weekIndex][dayIndex].date.clone();
      this.meetingListOfSelectedDate = [];
      this.previousMonth();
    } else if (selectedDate.isCurrentMonth === false && weekIndex !== 0) {
      this.meetingListOfSelectedDate = [];
      this.selectedDate = this.calendar[weekIndex][dayIndex].date.clone();
      this.nextMonth();
    }
  }

  manageJoinAgentMeeting(data: any) {
    if (data?.isRequestAlive) {
      return;
    }

    if (!data?.jamId) {
      if (data?.isCancelled || data?.isEnded) {
        return;
      }

      data.isRequestAlive = true;
      const { isRequestAlive, ...body } = data;
      this._facadeService.joinAgentMeetingService.create(body).subscribe({
        next: (res: any) => {
          if (res.code === 'OK') {
            if (res.data?._id) {
              data.jamId = res.data._id;
            }
          }
          delete data?.isRequestAlive;
        },
        error: (err: any) => {
          delete data?.isRequestAlive;
          console.log('Error while create JAM', err);
        }
      });
    } else {
      data.isRequestAlive = true;
      const { isRequestAlive, ...body } = data;
      this._facadeService.joinAgentMeetingService.delete(body.jamId).subscribe({
        next: (res: any) => {
          if (res.code === 'OK') {
            delete data.jamId;
          }
          delete data?.isRequestAlive;
        },
        error: (err: any) => {
          delete data?.isRequestAlive;
          console.log('Error while remove JAM', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }
}
