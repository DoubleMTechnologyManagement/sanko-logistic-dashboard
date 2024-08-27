import { DatePipe } from '@angular/common';
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService, VdbDet } from '../services/dashboard.service';

@Component({
  selector: 'app-outbound',
  templateUrl: './outbound.component.html',
  styleUrl: './outbound.component.css',
  providers: [DatePipe],
})
export class OutboundComponent {
  scheduleData: VdbDet[] = [];
  paginatedData: VdbDet[] = [];
  intervalSchedule: any;
  intervalDateTime: any;
  rxTime = new Date();
  subscription: Subscription = new Subscription();
  timer: Date = new Date();
  totalCount: number = 0;
  waitCount: number = 0;
  waitCCount: number = 0;
  delayCount: number = 0;
  completeCount: number = 0;
  cancelCount: number = 0;
  setTime: number = 30000; 
  setTimeRefreshNextPage: number = 10000; 

  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private apiService: DashboardService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.callApi();
    this.getSetTime().then(() => {
      this.startIntervals();
    }).catch(error => {
      console.error('Failed to get set time:', error);
      this.startIntervals(); 
    });
  }

  getSetTime(): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.apiService.getSetTime().subscribe({
        next: (data) => {
          if (data && data.WOC_VD_OUT) {
            this.setTime = parseInt(data.WOC_VD_OUT, 10) * 1000; 
          }
          resolve();
        },
        error: (error) => {
          console.error('API Error:', error);
          reject(error);
        },
      });
      this.subscription.add(subscription);
    });
  }

  callApi() {
    const apiSubscription = this.apiService.getEmployee().subscribe({
      next: (data) => {
        this.scheduleData = data.filter((item: VdbDet) => item.VDB_TYPE === 'VD->SDT');
        this.totalCount = this.scheduleData.length;
        this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
        this.startIntervalsNextPage();
        this.calculateCounts();
      },
      error: (error) => {
        console.error('API Error:', error);
      },
    });
    this.subscription.add(apiSubscription);
  }

  calculateCounts() {
    this.waitCount = this.scheduleData.filter(item => item.VDB_STATUS === "1").length;
    this.waitCCount = this.scheduleData.filter(item => item.VDB_STATUS === "2").length;
    this.completeCount = this.scheduleData.filter(item => item.VDB_STATUS === "3").length;
    this.delayCount = this.scheduleData.filter(item => item.VDB_STATUS === "4").length;
    this.cancelCount = this.scheduleData.filter(item => item.VDB_STATUS === "5").length;
  }

  updatePaginatedData() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.scheduleData.slice(start, end);
  }

  startIntervals() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalSchedule = setInterval(() => {
        this.callApi();
        this.cdr.detectChanges();
      }, this.setTime);

      this.intervalDateTime = setInterval(() => {
        this.timer = new Date();
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  startIntervalsNextPage() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalSchedule = setInterval(() => {
        this.currentPage = (this.currentPage + 1) % this.totalPages;
        this.updatePaginatedData();
        this.cdr.detectChanges();
      }, this.setTimeRefreshNextPage);

      this.intervalDateTime = setInterval(() => {
        this.timer = new Date();
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  ngOnDestroy() {
    if (this.intervalSchedule) {
      clearInterval(this.intervalSchedule);
    }

    if (this.intervalDateTime) {
      clearInterval(this.intervalDateTime);
    }
    this.subscription.unsubscribe();
  }
}
