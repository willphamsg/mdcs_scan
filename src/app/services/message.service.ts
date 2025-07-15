import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogModel,
  ConfirmationDialogComponent,
} from '../components/confirmation-dialog/confirmation-dialog.component';
import { throwError } from 'rxjs';
import { AppStore } from '@app/store/app.state';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@app/store/snackbar/snackbar.actions';
import { PayloadResponse } from '@app/models/common';
import MessageData from '@data/message-response.json';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(
    public dialog: MatDialog,
    private store: Store<AppStore>
  ) {}

  public multiError(err: HttpErrorResponse) {
    const multiMessage: string[] = [];
    const error = err.error;

    if (error != null || error != undefined) {
      if (error.errors != undefined && error.errors.length > 0) {
        error.errors.forEach((element: any) => {
          multiMessage.push(element.message);
        });
      } else {
        multiMessage.push(error.error);
      }

      this.store.dispatch(
        showSnackbar({
          message: multiMessage.toString(),
          title: 'Error',
          typeSnackbar: 'error',
        })
      );
    } else {
      if (err != null && err.message != null) {
        this.store.dispatch(
          showSnackbar({
            message: err.message,
            title: 'Error',
            typeSnackbar: 'error',
          })
        );
      }
    }

    // if (error != null || error != undefined) {
    //   error.errors.forEach((element: any) => {
    //     multiMessage.push(element.message);
    //   });

    //   this.dialog.open(ConfirmationDialogComponent, {
    //     height: '25%',
    //     width: '20%',
    //     data: new ConfirmDialogModel('Error', error.error, multiMessage, true),
    //   });
    // } else {
    //   if (err != null && err.message != null) {
    //     this.dialog.open(ConfirmationDialogComponent, {
    //       height: '25%',
    //       width: '20%',
    //       data: new ConfirmDialogModel('Error', err.message, [], true),
    //     });
    //   }
    // }

    return throwError(err);
  }

  public MessageResponse(value: PayloadResponse, errorOnly: boolean) {
    //Note: Added ErrorOnly so we will check and status code and show error only.
    const response = MessageData.find(x => x.status === value.status);
    if (response != undefined || response != null) {
      if (!errorOnly)
        this.store.dispatch(
          showSnackbar({
            message: value.message,
            title: response.title,
            typeSnackbar: response.snackbar,
          })
        );
      else {
        if (response.snackbar == 'error')
          this.store.dispatch(
            showSnackbar({
              message: value.message,
              title: response.title,
              typeSnackbar: response.snackbar,
            })
          );
      }
      return true;
    }
    return false;
  }

  public singleError(err: HttpErrorResponse) {
    let message = '';
    const error = err.error.errors;
    error.forEach((element: any) => {
      message = message + element.message;
    });

    this.dialog.open(ConfirmationDialogComponent, {
      height: '25%',
      width: '20%',
      data: new ConfirmDialogModel('Error', message, [], true),
    });

    return throwError(err);
  }

  public confirmation(title: string, message: string) {
    return this.dialog.open(ConfirmationDialogComponent, {
      height: '25%',
      width: '20%',
      data: new ConfirmDialogModel(title, message, [], true),
    });
  }

  public warning(title: string, message: string) {
    return this.dialog.open(ConfirmationDialogComponent, {
      height: '25%',
      width: '20%',
      data: new ConfirmDialogModel(title, message, [], false),
    });
  }
}
