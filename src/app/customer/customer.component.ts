import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompanyData, DashboardService, VdbDet } from '../services/dashboard.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {
  allCompaniesData: CompanyData[] = [];
  currentCompany: CompanyData | null = null;
  currentPage: number = 0;
  totalPages: number = 0;
  currentLine: number = 0;
  totalLine: number = 0;
  paginatedData: CompanyData['items'] = [];
  intervalSchedule: any;
  intervalDateTime: any;
  subscription: Subscription = new Subscription();
  timer: Date = new Date();
  setTime: number = 30000;
  setTimeRefreshNextPage: number = 10000;
  itemsPerPage: number = 5;
  currentCompanyIndex: number = 0;
  totalCount: number = 0;
  waitCount: number = 0;
  waitCCount: number = 0;
  delayCount: number = 0;
  completeCount: number = 0;
  cancelCount: number = 0;
  delayInMinutes: number = 0;

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
            if(data.WOC_VD_DELAY) {
              this.delayInMinutes = parseInt(data.WOC_VD_DELAY);
            } else {
              this.delayInMinutes = 0;
            }
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
    const apiSubscription = this.apiService.getCustomer().subscribe({
      next: (data) => {
        // const result = data.filter(item => item.VDB_NBR === 'PK25000464');
        console.log('API Result:', data);
        this.groupDataByCompanyAndTime(data);
        this.resetPagination();
        this.updatePaginatedData();
      },
      error: (error) => {
        console.error('API Error:', error);
      },
    });
    this.subscription.add(apiSubscription);
  }

  calculateTotalCount(result: CompanyData[]) {
    this.totalCount = result.length;
    this.waitCount = result.filter(item => item.VDB_STATUS === '1').length;
    this.waitCCount = result.filter(item => item.VDB_STATUS === '2').length;
    this.completeCount = result.filter(item => item.VDB_STATUS === '3').length;
    this.delayCount = result.filter(item => item.VDB_STATUS === '4').length;
    this.cancelCount = result.filter(item => item.VDB_STATUS === '5').length;
  }

  normalizeDisplayTime(displayTime: string): string {
    if (/^\d{2}\.\d{2}$/.test(displayTime)) {
      const [hours, fractionalMinutes] = displayTime.split('.').map(Number);
      const minutes = Math.round(fractionalMinutes * 0.6);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    const [hours, fractionalMinutes] = displayTime.split('.').map(Number);
    const minutes = Math.round(fractionalMinutes * 0.6); 
  
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  normalizeString(input: string): string {
    return input
    .trim() 
    .replace(/\s+/g, ' ') 
    .replace(/\s*([\(\)])\s*/g, '$1') 
    .replace(/\s*,\s*/g, ',')
    .replace(/\.$/, '')
    .toUpperCase();
  }

  groupDataByCompanyAndTime(data: VdbDet[]) {
    const companyMap: { [key: string]: CompanyData } = {};

    data.sort((a, b) => {
      const timeA = this.normalizeDisplayTime(a.DISPLAY_TIME);
      const timeB = this.normalizeDisplayTime(b.DISPLAY_TIME);
      return timeA.localeCompare(timeB);
    });

    data.forEach(item => {
        const companyName = this.normalizeString(item.VDB_COMP);
        const VDB_NBR = this.normalizeString(item.VDB_NBR);
        const productName = this.normalizeString(item.PRODUCT_NAME);
        const productItem = this.normalizeString(item.VDB_ITEM);
        const groupKey = this.normalizeString(`${companyName}-${VDB_NBR}-${item.DISPLAY_TIME}`);
        console.log('Group Key:', groupKey);
        if (!companyMap[groupKey]) {
            companyMap[groupKey] = {
                VDB_COMP: item.VDB_COMP,
                VDB_DRIVER: item.VDB_DRIVER,
                VDB_CAR: item.VDB_CAR,
                VDB_STATUS: item.VDB_STATUS,
                DISPLAY_TIME: item.DISPLAY_TIME,
                VDB_NBR: item.VDB_NBR,
                VDB_DATE: item.VDB_DATE,
                items: [],
                totalPages: 1,
                currentPage: 0,
                currentLine: 0,
                totalLine: 0
            };
        }

        // Check for duplicate items
          const isDuplicate = companyMap[groupKey].items.some(existingItem => 
            this.normalizeString(existingItem.VDB_ITEM) === productItem &&
            this.normalizeString(existingItem.PRODUCT_NAME) === productName &&
            existingItem.VDB_QTY === item.VDB_QTY &&
            this.normalizeString(existingItem.VDB_UM) === this.normalizeString(item.VDB_UM) &&
            this.normalizeString(existingItem.VDB_STATUS) === this.normalizeString(item.VDB_STATUS)
        );

        if (!isDuplicate) {
            companyMap[groupKey].items.push({
              orderNumber: companyMap[groupKey].items.length + 1,
              VDB_ITEM: item.VDB_ITEM,
              PRODUCT_NAME: item.PRODUCT_NAME,
              VDB_QTY: item.VDB_QTY,
              VDB_UM: item.VDB_UM,
              VDB_STATUS: item.VDB_STATUS
            });
        }
        console.log('Company Map:', companyMap);
    });

    this.allCompaniesData = Object.values(companyMap);
    this.totalPages = 0;
    this.allCompaniesData.forEach(company => {
        company.totalPages = Math.ceil(company.items.length / this.itemsPerPage);
        this.totalPages += company.totalPages; 
    });
    this.calculateTotalCount(this.allCompaniesData);
  }

  updateStatus(data: CompanyData[]) {
    data.forEach(company => {
      if (company.DISPLAY_TIME && (company.VDB_STATUS === '1' || company.VDB_STATUS === '2')) {
        const currentTime = new Date();
        const [hours, minutes] = company.DISPLAY_TIME.split('.').map(Number);
        const displayTime = new Date();
        displayTime.setHours(hours, minutes, 0, 0);
        displayTime.setMinutes(displayTime.getMinutes() + this.delayInMinutes);
        console.log(`Status = ${this.convertStatus(company.VDB_STATUS)} time: ${company.DISPLAY_TIME}, timeToUpdate:${displayTime} currentTime: ${currentTime}`);
        const isOverdue = displayTime < currentTime;
        console.log(`Company: ${company.VDB_COMP}, Is Overdue: ${isOverdue}`);
        if(isOverdue) {
          console.log("Need to update status");
          this.apiService.update(company, 'SDT->VD');
        } 
      }
    });
  }

  convertStatus(status: string): string {
    if(status === '1') {
      return 'wait';
    } else if(status === '2') {
      return 'waitC';
    } else if(status === '3') {
      return 'complete';
    } else if(status === '4') {
      return 'delay';
    } else {
      return 'cancel';
    }
  } 

  resetPagination() {
    this.currentCompanyIndex = 0;
    this.allCompaniesData.forEach(company => {
      company.currentPage = 0;
      company.currentLine = 0;
    });
  }

  updatePaginatedData() {
    if (this.allCompaniesData.length > 0) {
        let pageIndex = this.currentPage;
        let accumulatedPages = 0;
        let index = 0;
        for (const company of this.allCompaniesData) {
            this.totalLine = company.items.length;

            const companyPages = Math.ceil(company.items.length / this.itemsPerPage);
            accumulatedPages += companyPages;

            if (pageIndex < accumulatedPages) {
                const companyPageIndex = pageIndex - (accumulatedPages - companyPages);
                const start = companyPageIndex * this.itemsPerPage;
                const end = start + this.itemsPerPage;
                this.paginatedData = company.items.slice(start, end);
                this.currentCompany = company;

                 const maxLineNumber = Math.min(end, this.totalLine);
                 this.currentLine =   maxLineNumber;

                break;
            }
            index++;
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
            this.updateStatus(this.allCompaniesData);
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