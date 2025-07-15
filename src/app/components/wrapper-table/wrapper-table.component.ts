import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

export interface TableColumn<T> {
  columnDef: string;
  header: string;
  subHeader: Array<any>;
  cell: (element: T) => string | number;
}

@Component({
  selector: 'app-wrapper-table',
  templateUrl: './wrapper-table.component.html',
  styleUrl: './wrapper-table.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapperTableComponent<T> implements OnInit {
  @Input() dataSource: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() hasSearch = false;

  columnDefs: string[] = [];

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.columnDefs = this.columns?.map(column => column.columnDef as string);
  }
}
