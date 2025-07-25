import { Injectable } from '@angular/core';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  lang = 'all';
  constructor(
    private orderService: OrderService,
    private langService: ProductService
  ) {}

  async print(bill_no: number, print_for: any) {
    this.langService.getLang().subscribe((data: any) => {
      this.lang = data.lang;
      this.orderService
        .getAllOrderItems(bill_no, print_for)
        .subscribe((data: any) => {
          let orderItems = data['orderItems'];
          let order = data['order'];
          const printWindow = window.open('', '', 'width=800,height=600');
          if (printWindow) {
            let totalPrize = 0;
            printWindow.document.write(
              '<html><head><title>Print Invoice</title>'
            );
            printWindow.document.write('<style>');
            printWindow.document.write(`
        body { font-family: Arial, sans-serif; margin-top: 20px; }
        .bill-table { width: 100%; border-collapse: collapse; text-align: left; }
        .bill-table td, .bill-table th { padding: 3px; border: 1px solid grey; }
        .bill-table th { text-align: left; font-weight: bold; }
        .bill-info{ text-align: center;}
      `);
            printWindow.document.write('</style></head><body>');
            printWindow.document.write(
              '<h3 style="text-align: center">Welcome To Hotel Neelanjan</h3>'
            );
            // table upper data
            let today = new Date(order.createdAt)
              .toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
              .replace(',', '');
            printWindow.document.write(
              `<div class="bill-info"><p>${today}</p><p>Bill No: ${order.bill_no
                .toString()
                .slice(-5)}</p><p>Table No: ${order.table_no}</p>`
            );
            printWindow.document.write('</div>');
            // Check print is for QT or Bill
            printWindow.document.write('<table class="bill-table"><tbody>');
            if (print_for == 'qt') {
              // table headers
              printWindow.document.write(
                '<tr><th>Item</th><th>Qty</th><th>Tip</th></tr>'
              );
              // table rows
              orderItems.forEach((item: any) => {
                totalPrize += item.quantity * item.product_price;
                printWindow.document.write(`<tr><td>`);
                if (this.lang == 'e' || this.lang == 'all') {
                  printWindow.document.write(
                    `<span>${item.product_name}</span></br>`
                  );
                }
                if (this.lang == 'm' || this.lang == 'all') {
                  printWindow.document.write(`<span>${item.marathi}</span>`);
                }
                printWindow.document.write(
                  `</td><td>${item.quantity}</td><td>${
                    item.tip || ''
                  }</td></tr>`
                );
              });
            } else {
              // table headers
              printWindow.document.write(
                '<tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>'
              );
              // table rows
              orderItems.forEach((item: any) => {
                totalPrize += item.quantity * item.product_price;
                printWindow.document.write(`<tr><td>`);
                if (this.lang == 'e' || this.lang == 'all') {
                  printWindow.document.write(
                    `<span>${item.product_name}</span></br>`
                  );
                }
                if (this.lang == 'm' || this.lang == 'all') {
                  printWindow.document.write(`<span>${item.marathi}</span>`);
                }
                printWindow.document.write(`</td>
              <td>${item.quantity}</td>
              <td>${item.product_price}</td>
              <td>${item.quantity * item.product_price}</td>
              </tr>`);
              });
              if(order.discount){
                printWindow.document.write(
                  `<tr><td colspan="2">Total</td><td style="text-align: right">₹.</td><td>${totalPrize}</td></tr>`
                );
                printWindow.document.write(
                  `<tr><td colspan="2">Discount</td><td style="text-align: right">₹.</td><td>${order.discount}</td></tr>`
                );
              }
              // Grand Total
              printWindow.document.write(
                `<tr><th colspan="2">Grand Total</th><th style="text-align: right">₹.</th><th>${totalPrize - order.discount}</th></tr>`
              );
            }
            printWindow.document.write('</tbody></table>');
            printWindow.document.write(
              `<p style="text-align: center">Bill No: ${order.bill_no
                .toString()
                .slice(-5)}</p>`
            );
            printWindow.document.write(
              '<h3 style="text-align: center"> !! Visit Again !!</h3>'
            );
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }
        });
    });
  }
}
