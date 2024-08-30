import { DatePipe } from '@angular/common';
import { Component, NgZone, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompanyData, DashboardService, VdbDet } from '../services/dashboard.service';

@Component({
  selector: 'app-inbound',
  templateUrl: './inbound.component.html',
  styleUrls: ['./inbound.component.css'],
  providers: [DatePipe]
})
export class InboundComponent implements OnInit, OnDestroy {
  allCompaniesData: CompanyData[] = [];
  currentCompany: CompanyData | null = null;
  currentPage: number = 0;
  totalPages: number = 0;
  paginatedData: CompanyData['items'] = [];
  intervalSchedule: any;
  intervalDateTime: any;
  subscription: Subscription = new Subscription();
  timer: Date = new Date();
  setTime: number = 30000;
  setTimeRefreshNextPage: number = 10000;
  itemsPerPage: number = 10;
  currentCompanyIndex: number = 0;

  constructor(
    private apiService: DashboardService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.callApi();
    this.getSetTime().then(() => {
      this.startIntervals();
    }).catch(error => {
      console.error('Failed to get set time:', error);
      this.startIntervals();
    });
    this.startIntervalsNextPage();
  }

  getSetTime(): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.apiService.getSetTime().subscribe({
        next: (data) => {
          if (data && data.WOC_VD_IN) {
            this.setTime = parseInt(data.WOC_VD_IN, 10) * 1000;
          } else {
            this.setTime = 30000;
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
        const result = data.filter((item: VdbDet) => item.VDB_TYPE === 'SDT->VD');
        this.groupDataByCompanyAndTime(result);
        this.resetPagination();
        this.updatePaginatedData();
      },
      error: (error) => {
        console.error('API Error:', error);
      },
    });
    this.subscription.add(apiSubscription);
  }

  groupDataByCompanyAndTime(data: VdbDet[]) {
    const companyMap: { [key: string]: CompanyData } = {};

    data.forEach(item => {
        const groupKey = `${item.VDB_COMP}-${item.DISPLAY_TIME}`;
        if (!companyMap[groupKey]) {
            companyMap[groupKey] = {
                VDB_COMP: item.VDB_COMP,
                VDB_DRIVER: item.VDB_DRIVER,
                VDB_CAR: item.VDB_CAR,
                VDB_STATUS: item.VDB_STATUS,
                DISPLAY_TIME: item.DISPLAY_TIME,
                items: [],
                totalPages: 1,
                currentPage: 0
            };
        }
        companyMap[groupKey].items.push({
            VDB_ITEM: item.VDB_ITEM,
            PRODUCT_NAME: item.PRODUCT_NAME,
            VDB_QTY: item.VDB_QTY,
            VDB_UM: item.VDB_UM
        });
    });

    this.allCompaniesData = Object.values(companyMap);
    this.totalPages = 0;
    this.allCompaniesData.forEach(company => {
        company.totalPages = Math.ceil(company.items.length / this.itemsPerPage);
        this.totalPages += company.totalPages; 
    });
  }

  resetPagination() {
    this.currentCompanyIndex = 0;
    this.allCompaniesData.forEach(company => {
      company.currentPage = 0;
    });
  }

  updatePaginatedData() {
    if (this.allCompaniesData.length > 0) {
        let pageIndex = this.currentPage;
        let accumulatedPages = 0;

        for (const company of this.allCompaniesData) {
            const companyPages = Math.ceil(company.items.length / this.itemsPerPage);
            accumulatedPages += companyPages;

            if (pageIndex < accumulatedPages) {
                const companyPageIndex = pageIndex - (accumulatedPages - companyPages);
                const start = companyPageIndex * this.itemsPerPage;
                const end = start + this.itemsPerPage;
                this.paginatedData = company.items.slice(start, end);
                this.currentCompany = company;
                break;
            }
        }
    } else {
        this.paginatedData = [];
        this.currentCompany = null;
    }
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
            if (this.currentPage + 1 < this.totalPages) {
                this.currentPage++;
            } else {
                this.currentPage = 0;
            }

            this.updatePaginatedData();
            this.cdr.detectChanges();
        }, this.setTimeRefreshNextPage);
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