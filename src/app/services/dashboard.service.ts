import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private httpClient: HttpClient) {}

  getEmployee(): Observable<VdbDet[]> {
    return this.httpClient.post<VdbDet[]>('http://192.168.1.204/dashboard_vdout/dashboard.php', {
      mod: 'scheduleData'
    });
  }

  getSetTime(): Observable<SetTime> {
    return this.httpClient.post<SetTime>('http://192.168.1.204/dashboard_vdout/dashboard.php', {
      mod: 'setTime'
    });
  }
}

export interface SetTime {
  WOC_VD_IN: string;
  WOC_VD_OUT: string;
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

