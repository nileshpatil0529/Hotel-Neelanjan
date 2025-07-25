import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Inject } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { Router } from '@angular/router';
import { OrderHistoryService } from 'src/app/services/order-history.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-product-submit-dialog',
  templateUrl: './product-submit-dialog.component.html',
  styleUrls: ['./product-submit-dialog.component.css'],
})
export class ProductSubmitDialogComponent implements OnInit {
  totalBill = 0;
  discount = 0;
  displayedColumns: string[] = ['product_name', 'quantity', 'product_price', 'sub_total'];
  paymentOptions = [
    { value: 'online', label: 'Online' },
    { value: 'cash', label: 'Cash' },
    { value: 'pending', label: 'Pending' },
  ];
  paymentMethod: string | null = null;
  today: any = '';
  tableNumber = 0;
  seller: any = '';
  billNo = 0;
  checkComponent: any = 0;
  mergeCount = 0;
  mergeBills = 0;
  lang = 'all';
  shift: any = '';
  dataSource: MatTableDataSource<any>;
  tableList: any[] = [...Array.from({ length: 30 }, (_, i) => i + 1),];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orderService: OrderService,
    public dialogRef: MatDialogRef<ProductSubmitDialogComponent>,
    private router: Router,
    private orderHistService: OrderHistoryService,
    private langService: ProductService,
    private snackbarService: SnackbarService
  ) {
    this.dataSource = new MatTableDataSource();
    this.today = new Date();
  }

  ngOnInit(): void {
    this.getLang();
    this.getAllOrders();
  }

  getUserName() {
    return localStorage.getItem('userName');
  }

  getAllOrders() {
    this.checkComponent = this.data.checkComponent;
    if (!this.checkComponent) {
      this.dataSource.data = this.data.billData;
      this.tableNumber = this.data.tableNumber;
      this.seller = localStorage.getItem('userName');
      this.totalBill = this.getTotalBill(this.data.billData);
    } else {
      this.orderService
        .getAllOrderItems(this.data.billData, this.checkComponent)
        .subscribe({
          next: (data: any) => {
            this.dataSource.data = data.orderItems;
            this.tableNumber = data.order.table_no;
            this.seller = data.order.seller;
            this.billNo = data.order.bill_no;
            this.mergeCount = data.order.mergeBills.length;
            this.mergeBills = data.order.mergeBills;
            this.paymentMethod = data.order.payment;
            this.shift = '';
            this.today = new Date(data.order.createdAt);
            this.discount = data.order.discount;
            this.totalBill = data.order.total;
          },
        });
    }
  }

  getLang() {
    this.langService.getLang().subscribe((data: any) => {
      this.lang = data.lang;
    });
  }
  getTotalBill(arr: any) {
    return arr.reduce((total: any, item: any) => {
      return (total += item.quantity * item.product_price);
    }, 0);
  }

  makeOrder() {
    let billNo = Date.now();
    const productDetails = this.data.billData.map((product: any) => ({
      bill_no: billNo,
      product_id: product.product_id,
      marathi: product.marathi,
      quantity: product.quantity,
      product_name: product.product_name,
      product_price: product.product_price,
      tip: product.tip,
    }));
    const tableInfo = {
      table_no: this.tableNumber,
      seller: this.seller,
      bill_no: billNo,
      total: this.totalBill,
    };
    const param = { tableInfo, productDetails };
    this.orderService.createOrder(param).subscribe({
      next: () => {
        this.orderService.printBill(billNo, 'qt').subscribe();
        this.dialogRef.close(true);
        this.snackbarService.showMessage('Ordered Successfully!', 'success');
        this.router.navigate(['/dashboard/product-list']);
      },
    });
  }

  printBill(print_for: any): void {
    this.orderService.printBill(this.billNo, print_for).subscribe();
    this.close();
  }

  moveOrder() {
    this.orderHistService.moveOrder(this.billNo).subscribe({
      next: () => {
        this.close();
        this.orderService.printBill('', '').subscribe();
        this.snackbarService.showMessage(
          'Bill Closed successfully !',
          'success'
        );
      },
      error: () => {
        this.snackbarService.showMessage(
          'Failed to Print! Please try again.',
          'error'
        );
      },
    });
  }

  onPaymentMethodSelect() {
    const confirmed = confirm('Are you sure you want close the bill?');
    if(confirmed){
      this.orderService.updatePayment(this.billNo, this.paymentMethod).subscribe({
        next: () => {
          this.moveOrder();
        }
      });
    } else {
      setTimeout(() => {this.paymentMethod = '';}, 100);
    }
  }
  onShiftSelect() {
    const confirmed = confirm('Are you sure you want shift table?');
    if(confirmed){
      this.orderService.shiftTable(this.billNo, this.shift).subscribe({
        next: () => {
          this.getAllOrders();
          this.orderService.printBill('', '').subscribe();
          this.router.navigate(['/dashboard']);
          this.snackbarService.showMessage('Table Shifted successfully !','success');
        }
      });
    } else {
      setTimeout(() => {this.shift = '';}, 100);
    }
  }

  mergeAllBill() {
    this.orderService.mergeBills(this.billNo, this.mergeBills).subscribe({
      next: () => {
        this.orderService.printBill('', '').subscribe();
        this.getAllOrders();
        this.snackbarService.showMessage(
          'Merged Bill Successfully!',
          'success'
        );
      },
      error: (err) => {
        this.snackbarService.showMessage(
          'Failed to Merge! Please try again.',
          'error'
        );
      },
    });
  }

  clearPending(){
    const confirmed = confirm('Are you sure you want to settle due?');
    if(confirmed){
      this.orderService.updatePendingPayment(this.billNo, this.paymentMethod).subscribe({
        next: () => {
          this.close();
          this.snackbarService.showMessage('Due Cleared !','success');
        }
      });
    } else {
      setTimeout(() => {this.paymentMethod = 'pending';}, 100);
    }
  }

  deleteItem(bill_no: any, data: any) {
    const count = prompt("Enter quantity to delete:", "1");

    if (count) {
      this.orderService
        .deleteItem(
          bill_no,
          data.product_price * data.quantity,
          data.product_name,
          +count,
        )
        .subscribe({
          next: (data: any) => {
            this.orderService.printBill('', '').subscribe();
            if (!data.success) {
              this.close();
            } else {
              this.getAllOrders();
            }
            this.snackbarService.showMessage(
              'Item Deleted Successfully!',
              'success'
            );
          },
          error: (err) => {
            this.snackbarService.showMessage(
              'Failed to Delete Item! Please try again.',
              'error'
            );
          },
        });
    }
  }

  applyDiscount() {
    const discount = prompt('Enter discount value:');
    if (discount !== null && !isNaN(+discount)) {
        this.orderService.updateDiscount(this.billNo, +discount).subscribe({
          next: () => {
            this.getAllOrders();
            this.snackbarService.showMessage('Discount applied successfully!', 'success');
          },
          error: () => {
            this.snackbarService.showMessage('Failed to apply discount. Please try again.', 'error');
          },
        });
    }
  }

  close() {
    this.dialogRef.close(this.checkComponent);
  }
}
