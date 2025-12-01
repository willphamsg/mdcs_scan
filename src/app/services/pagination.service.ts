import { Injectable } from '@angular/core';
import { IPaginationEvent, IParams } from '@app/models/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private dataSource: any[] = [];
  private paginatedDataSubject = new BehaviorSubject<any[]>([]);
  paginatedData$ = this.paginatedDataSubject.asObservable();

  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  loadData(
    data: any[],
    itemsPerPage: number,
    currentPage: number,
    totalItems: number
  ) {
    this.dataSource = data;
    this.pageSize = itemsPerPage;
    this.totalItems = totalItems;
    this.currentPage = currentPage;

    // TODO: Remove this when all pages is integrated with BE
    if (environment?.useDummyData) {
      this.paginateData();
    } else {
      this.paginatedDataSubject.next(this.dataSource);
    }
  }

  paginateData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Number(startIndex) + Number(this.pageSize);
    const paginatedData = this.dataSource.slice(startIndex, endIndex);

    this.paginatedDataSubject.next(paginatedData);
  }

  handlePageEvent(
    params: IParams,
    event: IPaginationEvent,
    reloadCallback: () => void
  ): void {
    params.page_size = event.pageSize;
    params.page_index = event.page - 1;
    reloadCallback();
  }

  goToPage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.paginateData();
  }

  getTotalPages(totalItems: number): number {
    return Math.ceil(totalItems / this.pageSize);
  }

  setItemsPerPage(itemsPerPage: number) {
    this.pageSize = itemsPerPage;
    this.currentPage = 1;
    this.paginateData();
  }

  clearPagination(): void {
    this.dataSource = [];
    this.paginatedDataSubject.next([]);
    this.pageSize = 10;
    this.currentPage = 1;
    this.totalItems = 0;
  }
}
