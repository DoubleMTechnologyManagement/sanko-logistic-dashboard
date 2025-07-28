import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

interface ProductionLine {
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

interface DashboardData {
  assembly: string;
  lines: ProductionLine[];
  timestamp: string;
  stats: {
    assembly: number;
    painting: number;
    metal: number;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  dashboardData: DashboardData = {
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
    timestamp: '08:45',
    stats: {
      assembly: 30,
      painting: 15,
      metal: 25
    }
  };

  currentTime = new Date();
  currentScreen = 2;
  selectedLines = '1 / 2 / 3 ...N';
  completionRate = 25;
  
  screens = [
    { id: 1, lines: [{ id: 1, status: 'work' }, { id: 2, status: 'finish' }] },
    { id: 2, lines: [{ id: 3, status: 'not_work' }, { id: 4, status: 'work' }] },
    { id: 3, lines: [{ id: 5, status: 'finish' }, { id: 6, status: 'machine_down' }] }
  ];

  private subscription?: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.updateTime();
    this.loadDashboardData();
    
    // Update time every second
    this.subscription = interval(1000).subscribe(() => {
      this.updateTime();
    });

    // Update dashboard data every 30 seconds
    interval(30000).subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  updateTime() {
    this.currentTime = new Date();
  }

  loadDashboardData() {
    this.http.get<DashboardData>('/api/dashboard/data').subscribe(
      (data) => {
        this.dashboardData = data;
        this.calculateCompletionRate();
      },
      (error) => {
        console.error('Error loading dashboard data:', error);
        // Use mock data on error
        this.simulateDataUpdate();
      }
    );
  }

  simulateDataUpdate() {
    // Simulate real-time updates for demo
    this.dashboardData.lines.forEach(line => {
      if (line.status === 'work') {
        const randomSlot = Math.floor(Math.random() * line.timeSlots.length);
        if (Math.random() > 0.7) {
          line.timeSlots[randomSlot] = Math.min(line.timeSlots[randomSlot] + 1, line.order);
        }
      }
    });
    
    this.calculateCompletionRate();
  }

  calculateCompletionRate() {
    const totalOrder = this.dashboardData.lines.reduce((sum, line) => sum + line.order, 0);
    const totalProduced = this.dashboardData.lines.reduce((sum, line) => 
      sum + line.timeSlots.reduce((slotSum, slot) => slotSum + slot, 0), 0
    );
    
    this.completionRate = totalOrder > 0 ? Math.round((totalProduced / totalOrder) * 100) : 0;
  }

  getRowClass(status: string): string {
    return status.replace('_', '-');
  }
}
