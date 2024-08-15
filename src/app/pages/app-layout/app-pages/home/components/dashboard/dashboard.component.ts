import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Regex } from '@src/app/constants/regex';


type TCalendarPlatform = 'teams' | 'zoom' | 'meet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private _facadeService: FacadeService,
    private _fb: FormBuilder,
  ) {
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        if (this.projectDetails) {
          this.getData();
        }
      }
    });

    this.scheduleMeetingForm = this._fb.group({
      platform: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      description: [''],
      attendees: [''],
      date: ['', [Validators.required, this.minTodayDateValidator]],
      startTime: ['', [Validators.required]],
      duration: [null, [Validators.required, Validators.min(1)]]
    });

    // this.isMicrosoftUser = this._facadeService.appService.isMicrosoftUser;
  }

  protected readonly appRoutes = Routes;
  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;
  protected sentimentByRatingChartData: any = {
    series: [],
    categories: []
  };

  // protected isMicrosoftUser: boolean = false;
  protected calendar: Array<Array<{ day: number, date: moment.Moment, isCurrentMonth: boolean }>> = [];
  protected currentDate!: moment.Moment;
  protected toDayDate: moment.Moment = moment();
  protected selectedDate!: moment.Moment;
  protected calendarMeetingDetailsObj: { [key: string]: Array<any> } = {};
  protected meetingListOfSelectedDate!: any;

  protected isEventAdding: boolean = false;
  protected scheduleMeetingForm: FormGroup;
  protected platformList: Array<string> = [];


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

  @ViewChild('sentimentByRatingChart') sentimentByRatingChart!: ElementRef;


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

  /** sentiment By Rating Chart */
  protected SRChart: any;
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

    this.SRChart = this.Highcharts.chart('sentimentByRatingChart', {
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

  @HostListener('window:resize', ['$event'])
  onResize(e: any) {
    if (this.SRChart) {
      /** 1216 max width for Highcharts adjust on resize */
      const chartWidth = this.sentimentByRatingChart.nativeElement.clientWidth - 32;
      if (e.target.innerWidth <= 1024) {
        this.SRChart.setSize(Math.min(1216, chartWidth), null);
      } else {
        const calendarOffset = (this.sentimentByRatingChart.nativeElement.querySelector('.calendar-container')?.clientWidth ?? 0) + 16;
        this.SRChart.setSize(Math.min(1216, (chartWidth - calendarOffset)), null);
      }
    }
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
          this.platformList = res.data?.platformList ?? [];

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

  get smfSubject(): AbstractControl {
    return this.scheduleMeetingForm.get('subject') as FormControl;
  }

  get smfDate(): AbstractControl {
    return this.scheduleMeetingForm.get('date') as FormControl;
  }

  get smfStartTime(): AbstractControl {
    return this.scheduleMeetingForm.get('startTime') as FormControl;
  }

  get smfDuration(): AbstractControl {
    return this.scheduleMeetingForm.get('duration') as FormControl;
  }

  get smfAttendees(): AbstractControl {
    return this.scheduleMeetingForm.get('attendees') as FormControl;
  }

  onChangeMeetingPlatform(event: string): void {
    this.scheduleMeetingForm.get('platform')?.patchValue(event);
  }

  emailListValidator() {
    const emails = this.smfAttendees.value ?? '';
    const emailList = emails.split(',').filter(Boolean);
    const invalidEmails: string[] = [];

    emailList.forEach((email: string) => {
      email = email.trim();
      if (email.length > 0 && !(Regex.EMAIL).test(email)) {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      this.smfAttendees.setErrors({ invalidEmails: invalidEmails });
    } else {
      this.smfAttendees.setErrors(null);
    }
  }

  minTodayDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const inputDate = moment(control.value);
    /** set time T00:00:00:0000 */
    const today = moment().startOf('day');

    return (!control.value || !inputDate.isValid() || inputDate.isBefore(today)) ? { 'minTodayDate': true } : null;
  }

  onAddMeetingToSchedule(): void {
    if (this.isEventAdding) {
      return;
    }

    this.isEventAdding = true;
  }

  onCancelMeetingToSchedule(): void {
    if (!this.isEventAdding) {
      return;
    }

    this.isEventAdding = false;
    this.scheduleMeetingForm.reset({ platform: '', subject: '', description: '', attendees: '', date: '', startTime: '', duration: null });
  }

  protected isCreateMeetingRequestAlive: boolean = false;
  onCreateMeeting(): void {
    this.emailListValidator();
    if (this.isCreateMeetingRequestAlive || this.scheduleMeetingForm.invalid) {
      this.scheduleMeetingForm.markAllAsTouched();
      return;
    }

    const body = {
      platform: this.scheduleMeetingForm.value.platform,
      subject: this.scheduleMeetingForm.value.subject,
      description: this.scheduleMeetingForm.value.description,
      date: this.scheduleMeetingForm.value.date,
      startTime: this.scheduleMeetingForm.value.startTime,
      dateTime: moment(`${this.scheduleMeetingForm.value.date}T${this.scheduleMeetingForm.value.startTime}`).toISOString(),
      duration: this.scheduleMeetingForm.value.duration,
      attendees: this.scheduleMeetingForm.value.attendees.split(',').map((email: string) => email.trim()).filter(Boolean)
    };

    this.isCreateMeetingRequestAlive = true;
    this._facadeService.dashboardService.createMeeting(body).subscribe({
      next: (res: any) => {
        this.isCreateMeetingRequestAlive = false;
        if (res.code === 'CREATED') {
          const response = res.data;
          if (moment(response.date).format('YYYY_MM') === this.currentDate.format('YYYY_MM')) {
            if (!this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')]) {
              this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')] = [];
            }

            response.startTime = moment(response.startDateTime);
            response.endTime = moment(response.endDateTime);
            response.isEnded = response.endTime.isBefore(moment());
            this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')].push(response);
            this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')].sort((a: any, b: any) => a.startTime - b.startTime);

            const singleDateList = this.calendarMeetingDetailsObj[this.currentDate.format('YYYY_MM')]?.filter((item: any) => item.startTime.format('YYYY-MM-DD') === this.selectedDate.format('YYYY-MM-DD'));
            this.meetingListOfSelectedDate = singleDateList;
          }

          this.onCancelMeetingToSchedule();
        }
      },
      error: (err: any) => {
        this.isCreateMeetingRequestAlive = false;
        this._facadeService.appService.openToaster(err.error.message, 'danger');
        console.log('Error while create meeting', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }
}
