import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductSubmitDialogComponent } from '../product/product-submit-dialog/product-submit-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'bill_no',
    'table_no',
    'seller',
    'total_bill',
    'createdAt',
    'delete',
  ];
  table_no: any;
  dataSource = [];
  private orderCreatedSub!: Subscription;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((data) => {
      this.table_no = data.table_no;
    });
    this.getAllBillItems();
    this.orderCreatedSub = this.orderService.onOrderCreated().subscribe(() => {
      this.getAllBillItems();
    });
  }

  getUserName() {
    return localStorage.getItem('userName');
  }

  getAllBillItems() {
    this.orderService.getOrders(this.table_no).subscribe((data: any) => {
      this.dataSource = data;
    });
  }

  bill(bill_no: number, event: Event) {
    event.stopPropagation();
    let billData = bill_no;
    const dialogRef: any = this.dialog.open(ProductSubmitDialogComponent, {
      width: '100%',
      data: { billData: billData, tableNumber: 0, checkComponent: true },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAllBillItems();
      }
    });
  }

  deleteOredr(bill_no: number, event: Event) {
    event.stopPropagation();
    const deleteorderConfirm = confirm('Are you sure you want to Delete?');

    if(deleteorderConfirm){
      this.orderService.deleteOrder(bill_no).subscribe(data => {
        this.snackbarService.showMessage('Order Deleted Successfully!', 'success');
        this.getAllBillItems();
      });
    }
  }

  ngOnDestroy() {
    if (this.orderCreatedSub) {
      this.orderCreatedSub.unsubscribe();
    }
  }
}
