import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationService } from '@app/services/pagination.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnDestroy {
  private _totalItems: number = 0;
  @Input()
  set totalItems(value: number) {
    if (value) {
      this._totalItems = value;
      this.generatePageSizeOptions();
    }
  }
  get totalItems(): number {
    return this._totalItems;
  }

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageSizeOptions: number[] = [];

  constructor(private paginationService: PaginationService) {}

  get totalPages(): number {
    return this.paginationService.getTotalPages(this.totalItems);
  }

  ngOnDestroy(): void {
    this.paginationService.clearPagination();
  }

  generatePageSizeOptions(): void {
    const maxPageSize = Math.ceil(this.totalItems / 10) * 10;
    this.pageSizeOptions = [];
    for (let i = 10; i <= maxPageSize; i += 10) {
      this.pageSizeOptions.push(i);
    }
  }

  onItemsPerPageChange(): void {
    this.paginationService.setItemsPerPage(this.itemsPerPage);
    this.currentPage = 1;
    this.emitPageChange();
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.currentPage * this.itemsPerPage;
    return endIndex > this.totalItems ? this.totalItems : endIndex;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationService.goToPage(this.currentPage);
      this.emitPageChange();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationService.goToPage(this.currentPage);
      this.emitPageChange();
    }
  }

  emitPageChange() {
    this.pageChange.emit({
      page: this.currentPage,
      pageSize: this.itemsPerPage,
    });
  }
}
