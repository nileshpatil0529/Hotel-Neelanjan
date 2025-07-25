import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { PrinterService } from 'src/app/services/printer.service';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(MatSidenav) drawer!: MatSidenav;
  userID: any;
  private orderCreatedSub!: Subscription;
  lang = 'all';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private printServ: PrinterService,
    private langService: ProductService,
  ) {}

  ngOnInit(): void {
    this.getLang();
    this.orderCreatedSub = this.orderService.onOrderCreated().subscribe((bill: any) => {
      if (this.getUserName()?.toLowerCase() === 'admin' && bill.bill_no && bill.print_for) {
        this.printServ.print(bill.bill_no, bill.print_for);
      }
    });
  }

  toggleDrawer(): void {
    this.drawer.toggle();
  }

  getLang(){
    this.langService.getLang().subscribe((data: any) => {
      this.lang = data.lang;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  getUserName() {
    return localStorage.getItem('userName');
  }

  getUserID(): any {
    return '/update-password/' + localStorage.getItem('userID');
  }

  changeLang(lang: any){
    this.langService.changeLang({lang}).subscribe(data => {
      this.getLang();
    })
  }

  ngOnDestroy() {
    if (this.orderCreatedSub) {
      this.orderCreatedSub.unsubscribe();
    }
  }
}
