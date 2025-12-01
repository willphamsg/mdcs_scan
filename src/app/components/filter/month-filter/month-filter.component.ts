import { Component } from '@angular/core';

@Component({
    selector: 'app-month-filter',
    imports: [],
    templateUrl: './month-filter.component.html',
    styleUrl: './month-filter.component.scss'
})
export class MonthFilterComponent {
  currentDate: Date = new Date();

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  prevMonth(): void {
    this.currentDate = new Date(
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    );
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
    );
  }
}
