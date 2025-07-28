import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, ProductionDashboardData, ProductionLine } from '../services/dashboard.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.scss'
})
export class DashboardViewComponent implements OnInit, OnDestroy {
  
  productionData: ProductionDashboardData = {
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
      },
      {
        id: 4,
        job: '354021',
        item: '40BGV0182UP',
        order: 8,
        bl: 2,
        timeSlots: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        status: 'machine_down',
        balance: 5,
        total_produced: 3
      }
    ],
    timestamp: '03:29',
    completionRate: 25,
    selectedLines: '1 / 2 / 3 ...N',
    currentScreen: 2
  };

  currentTime = new Date();
  timeSlots = ['8-9', '9-10', '10-11', '11-12', 'B', '13-14', '14-15', '15-16', '16-17', '17-18'];
  
  private subscription?: Subscription;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.updateTime();
    this.calculateCompletionRate();
    
    // Update time every second
    this.subscription = interval(1000).subscribe(() => {
      this.updateTime();
    });

    // Simulate data updates every 30 seconds
    interval(30000).subscribe(() => {
      this.simulateDataUpdate();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  updateTime() {
    this.currentTime = new Date();
    this.productionData.timestamp = this.currentTime.toTimeString().slice(0, 5);
  }

  simulateDataUpdate() {
    // Simulate real-time updates for demo
    this.productionData.lines.forEach(line => {
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
    const totalOrder = this.productionData.lines.reduce((sum, line) => sum + line.order, 0);
    const totalProduced = this.productionData.lines.reduce((sum, line) => 
      sum + line.timeSlots.reduce((slotSum, slot) => slotSum + slot, 0), 0
    );
    
    this.productionData.completionRate = totalOrder > 0 ? Math.round((totalProduced / totalOrder) * 100) : 0;
  }

  getRowClass(status: string): string {
    return status.replace('_', '-');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'finish': return '#4caf50';
      case 'work': return '#2196f3';
      case 'not_work': return '#ffeb3b';
      case 'machine_down': return '#f44336';
      default: return '#666';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'finish': return 'Finish';
      case 'work': return 'Work';
      case 'not_work': return 'Not Work';
      case 'machine_down': return 'Machine Down';
      default: return status;
    }
  }
}
