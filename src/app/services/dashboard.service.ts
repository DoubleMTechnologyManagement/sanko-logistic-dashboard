import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  API_URL = 'http://192.168.1.204/dashboard_vdout/dashboard.php';

  constructor(private httpClient: HttpClient) {}

  getEmployee(): Observable<VdbDet[]> {
    return this.httpClient.post<VdbDet[]>(this.API_URL, {
      mod: 'scheduleData'
    });
  }

  getCustomer(): Observable<VdbDet[]> {
    return this.httpClient.post<VdbDet[]>(this.API_URL, {
      mod: 'customerData'
    });
  }

  getSetTime(): Observable<SetTime> {
    return this.httpClient.post<SetTime>(this.API_URL, {
      mod: 'setTime'
    });
  }

  update(company: CompanyData, VDB_TYPE: String): void {
    this.httpClient.post<SetTime>(this.API_URL, {
      mod: 'updateStatus',
      data: {
        VDB_COMP: company.VDB_COMP,
        VDB_DRIVER: company.VDB_DRIVER,
        VDB_CAR: company.VDB_CAR,
        VDB_NBR: company.VDB_NBR,
        VDB_DATE: company.VDB_DATE,
        VDB_TYPE: VDB_TYPE,
        DISPLAY_TIME: company.DISPLAY_TIME
      }
    }).subscribe(response => {
      console.log('Status updated:', response);
    }, error => {
      console.error('Error updating status:', error);
    });
  }
}

export interface SetTime {
  WOC_VD_IN: string;
  WOC_VD_OUT: string;
  WOC_VD_DELAY: string;
}

export interface CompanyData {
  VDB_COMP: string;
  VDB_DRIVER: string;
  VDB_CAR: string;
  VDB_STATUS: string;
  DISPLAY_TIME: string;
  VDB_DATE: Date;
  VDB_NBR: string;
  items: Array<{
    VDB_ITEM: string;
    PRODUCT_NAME: string;
    VDB_QTY: number;
    VDB_UM: string;
    VDB_STATUS: string;
    orderNumber: number;
  }>;
  totalPages: number;
  currentPage: number;
  currentLine: number;
  totalLine: number;
}

export interface VdbDet {
  VDB_TYPE: string;
  VDB_NBR: string;
  VDB_COMP: string;
  VDB_DATE: Date;
  VDB_EFFDATE: Date;
  VDB_DRIVER: string;
  VDB_CAR: string;
  VDB_ITEM: string;
  PRODUCT_NAME: string;
  VDB_QTY: number;
  VDB_UM: string;
  VDB_STATUS: string;
  VDB_RMKS: string;
  VDB_USER: string;
  VDB_CHR01: string;
  VDB_CHR02: string;
  VDB_CHR03: string;
  VDB_NUM01: number;
  VDB_NUM02: number;
  VDB_NUM03: number;
  VDB_DATE01: Date;
  VDB_DATE02: Date;
  VDB_DATE03: Date;
  DISPLAY_TIME: string;
}