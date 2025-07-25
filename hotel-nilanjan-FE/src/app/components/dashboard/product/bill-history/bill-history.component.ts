import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserService } from 'src/app/services/user.service';
import { OrderHistoryService } from 'src/app/services/order-history.service';
import { ProductSubmitDialogComponent } from '../product-submit-dialog/product-submit-dialog.component';

@Component({
  selector: 'app-bill-history',
  templateUrl: './bill-history.component.html',
  styleUrls: ['./bill-history.component.css'],
  providers: [DatePipe],
})
export class BillHistoryComponent implements OnInit {
  form: FormGroup;
  products = [];
  users: any = [];
  displayedColumns: string[] = [
    'bill_no',
    'table_no',
    'seller',
    'pay_mode',
    'total',
    'createdAt',
  ];
  tableOptions = [
    ...Array.from({ length: 31 }, (_, i) => i), // Numbers 0 to 30
    ...Array.from({ length: 5 }, (_, i) => `Party-${i + 1}`), // "Party-1" to "Party-5"
    ...Array.from({ length: 10 }, (_, i) => `Parcel-${i + 1}`), // "Parcel-1" to "Parcel-10"
    ...Array.from({ length: 20 }, (_, i) => `Room-No-${i + 1}`), // "Room-No-1" to "Room-No-20"
  ];
  paymentOptions = ['online', 'cash', 'pending']
  dataSource :any= [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private datePipe: DatePipe,
    private orderHistServ: OrderHistoryService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      table_no: [''],
      seller: [''],
      payment: [''],
      fromDate: [new Date()],
      toDate: [this.addOneDay(new Date())],
    });
  }

  ngOnInit(): void {
    this.getUserList();
    this.getHistoricleData();
  }

  getHistoricleData() {
    this.orderHistServ.orderFilteredData(this.form.value).subscribe(data => {
      this.dataSource = data;
    });
  }

  getUserList() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    })
  }

  addOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }

  getTodayStart() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return startOfDay;
  };

  clear() {
    this.form.reset({
      product_name: '',
      user: '',
      payment: '',
      fromDate: new Date(),
      toDate: this.addOneDay(new Date()),
    });
    this.getHistoricleData();
  }

  generatePDF() {
    const doc = new jsPDF();
  
    // Add logo
    const img = new Image();
    img.src = 'assets/img/logo.jpg'; // Path to your logo
  
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 50; // Width of the image
      const xPosition = (pageWidth - imgWidth) / 2; // Center the image
      doc.addImage(img, 'PNG', xPosition, 10, imgWidth, 23); // x, y, width, height
  
      // Add title and date
      const currentDate = this.datePipe.transform(new Date(), 'dd/MM/yy');
      doc.setFontSize(12);
      doc.text(`Date: ${currentDate}`, 160, 20); // Adjust X, Y for date
  
      // Calculate total revenue
      // Calculate total revenue grouped by payment methods
    const groupedRevenue = this.dataSource.reduce((acc: any, item: any) => {
      const paymentType = item.payment || 'unknown';
      acc[paymentType] = (acc[paymentType] || 0) + (item.total - item.discount);
      acc.totalRevenue = (acc.totalRevenue || 0) + (item.total - item.discount);
      return acc;
    }, {});
  
      // Add dynamic details if available
      const formData = this.form.value; // Access form data
      const details = [];
      if (formData.table_no) details.push(`Table No: ${formData.table_no}`);
      if (formData.seller) details.push(`Seller: ${formData.seller}`);
      if (formData.payment) details.push(`Payment: ${formData.payment}`);
      if (formData.fromDate) details.push(`From Date: ${this.datePipe.transform(formData.fromDate, 'dd/MM/yy')}`);
      if (formData.toDate) details.push(`To Date: ${this.datePipe.transform(formData.toDate, 'dd/MM/yy')}`);
      
      // Add revenue breakdown
    details.push(
      `Total Revenue: Rs. ${groupedRevenue.totalRevenue - (groupedRevenue.pending || 0)}, Pending: Rs. ${groupedRevenue.pending || 0}`
    );
    details.push(
      `(Cash: Rs. ${groupedRevenue.cash || 0}, Online: Rs. ${groupedRevenue.online || 0})`
    );
  
      doc.setFontSize(12);
      details.forEach((detail, index) => {
        doc.text(detail, 10, 40 + index * 7); // Adjust Y dynamically
      });
  
      // Add table header
      const headers = ['Bill No', 'Table No', 'Seller', 'Payment', 'Total', 'Created At'];
      const rows = this.dataSource.map((item: any) => [
        item.bill_no,
        item.table_no,
        item.seller,
        item.payment,
        item.total - item.discount,
        this.datePipe.transform(item.createdAt, 'dd/MM/yy, hh:mm a'),
      ]);
  
      // Use autoTable to add the table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 45 + details.length * 7, // Start below the dynamic details
        styles: { fontSize: 10 },
      });
  
      // Save the PDF
      doc.save(`Bill-Neelanjan-${new Date().toLocaleString()}`);
    };
}

  bill(bill_no: number, event: Event) {
      event.stopPropagation();
      let billData = bill_no;
      const dialogRef: any = this.dialog.open(ProductSubmitDialogComponent, {
        width: '100%',
        data: { billData: billData, tableNumber: 0, checkComponent: 'history' },
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.getHistoricleData();
        }
      });
    }

}
