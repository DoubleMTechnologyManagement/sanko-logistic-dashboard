import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  API_URL = 'http://192.168.1.204/dashboard_vdout/dashboard.php';

  // Add BehaviorSubject for dashboard data
  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  private productionDataSubject = new BehaviorSubject<ProductionDashboardData | null>(null);

  // Add httpOptions for HTTP requests
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private httpClient: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.httpClient.get<DashboardData>(`${this.API_URL}/dashboard/data`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  // Get production dashboard data
  getProductionDashboardData(): Observable<ProductionDashboardData> {
    return this.httpClient.get<ProductionDashboardData>(`${this.API_URL}/production/dashboard`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  // Get single production line
  getProductionLine(id: number): Observable<ProductionLine> {
    return this.httpClient.get<ProductionLine>(`${this.API_URL}/dashboard/data?id=${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Update production line
  updateProductionLine(line: ProductionLine): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/production/update`, line, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update specific time slot
  updateTimeSlot(lineId: number, timeSlot: number, value: number): Observable<any> {
    const data = {
      id: lineId,
      timeSlot: timeSlot,
      value: value
    };
    
    return this.httpClient.put(`${this.API_URL}/production/update`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Create new production line
  createProductionLine(line: Partial<ProductionLine>): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/production/create`, line, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update dashboard data in service
  updateDashboardData(data: DashboardData): void {
    this.dashboardDataSubject.next(data);
  }

  // Update production dashboard data in service
  updateProductionDashboardData(data: ProductionDashboardData): void {
    this.productionDataSubject.next(data);
  }

  // Get current dashboard data
  getCurrentDashboardData(): DashboardData | null {
    return this.dashboardDataSubject.value;
  }

  // Get current production dashboard data
  getCurrentProductionDashboardData(): ProductionDashboardData | null {
    return this.productionDataSubject.value;
  }

  // Calculate completion rate
  calculateCompletionRate(lines: ProductionLine[]): number {
    const totalOrder = lines.reduce((sum, line) => sum + line.order, 0);
    const totalProduced = lines.reduce((sum, line) => 
      sum + line.timeSlots.reduce((slotSum, slot) => slotSum + slot, 0), 0
    );
    
    return totalOrder > 0 ? Math.round((totalProduced / totalOrder) * 100) : 0;
  }

  // Get mock production data
  getMockProductionData(): ProductionDashboardData {
    return {
      assembly: '1',
      lines: [
        {
          id: 1,
          job: '360302',
          item: 'ASU400S303',
          order: 10,
          bl: 0,
          timeSlots: [2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
          status: 'work',
          balance: 10,
          total_produced: 8
        },
        {
          id: 2,
          job: '329592',
          item: '40RBW024-4RV',
          order: 15,
          bl: 0,
          timeSlots: [0, 0, 0, 0, 0, 5, 5, 5, 0, 0],
          status: 'finish',
          balance: 15,
          total_produced: 15
        },
        {
          id: 3,
          job: '354020',
          item: '40BGV0181UP',
          order: 12,
          bl: 0,
          timeSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          status: 'not_work',
          balance: 0,
          total_produced: 0
        }
      ],
      timestamp: '10:21',
      completionRate: 25,
      selectedLines: '1 / 2 / 3 ...N',
      currentScreen: 2
    };
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}

export interface ProductionLine {
  id: number;
  job: string;
  item: string;
  order: number;
  bl: number;
  timeSlots: number[];
  status: 'finish' | 'work' | 'not_work' | 'machine_down';
  balance: number;
  total_produced: number;
}

export interface DashboardData {
  assembly: string;
  lines: ProductionLine[];
  timestamp: string;
  stats: {
    assembly: number;
    painting: number;
    metal: number;
  };
}

export interface ProductionDashboardData {
  assembly: string;
  lines: ProductionLine[];
  timestamp: string;
  completionRate: number;
  selectedLines: string;
  currentScreen: number;
}