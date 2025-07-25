import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService } from 'src/app/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ProductSubmitDialogComponent } from '../product-submit-dialog/product-submit-dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  data: any = [];
  searchValue: string = '';
  displayedColumns: string[] = ['product_name', 'tip', 'action'];
  dataSource: MatTableDataSource<any>;
  filteredData: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator; // Add paginator reference
  tableList: any[] = [
    ...Array.from({ length: 31 }, (_, i) => i), // Numbers 0 to 30
    ...Array.from({ length: 5 }, (_, i) => `Party-${i + 1}`), // "Party-1" to "Party-5"
    ...Array.from({ length: 10 }, (_, i) => `Parcel-${i + 1}`), // "Parcel-1" to "Parcel-10"
    ...Array.from({ length: 20 }, (_, i) => `Room-No-${i + 1}`), // "Room-No-1" to "Room-No-20"
  ];
  filteredTables: string[] = [...this.tableList];
  tableNumber: any = 0;
  selectedTip: any;
  loading: boolean = true;
  tips: any[] = ['Patla', 'Spicy', 'M. Spicy', 'Latpat', 'Jain', 'Light', ...Array.from({ length: 15 }, (_, i) => i + 1),];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService,
    private productServ: ProductService
  ) {
    this.dataSource = new MatTableDataSource(this.data);
    this.filteredData = new MatTableDataSource(this.data);
  }

  ngOnInit(): void {
    const localData = localStorage.getItem('productsData');
    if (localData) {
      const products = JSON.parse(localData);
      this.processData(products);
      this.loading = false;
    } else {
      this.getAllProducts();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator; // Attach paginator to dataSource
  }

  getAllProducts() {
    this.loading = true;
    this.productServ.getAllProducts().subscribe((data: any) => {
      this.data = data.map((item: any) => ({
        ...item,
        newQuantity: null,
        seller: localStorage.getItem('userName'),
      }));
      localStorage.setItem('productsData', JSON.stringify(this.data));
      this.processData(this.data);
      this.dataSource.data = this.data; // Set data for MatTableDataSource
      this.loading = false;
    });
  }

  private processData(products: any[]) {
    this.data = products;
    this.dataSource.data = products;
    this.filteredData.data = products;
  }
  
  clearSearch(): void {
    this.searchValue = '';
    this.dataSource.filter = '';
    this.dataSource.data = this.dataSource.data;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); // Reset to the first page after filtering
    }
  }

  hasErrors(): any {
    let isError = false;
    isError =
      this.filteredData.data.every((item) => item.quantity === 0) ||
      !this.tableNumber;
    return isError;
  }

  generateBill(): void {
    let billData = this.data.filter((item: any) => {
      return item.quantity !== 0;
    });
    const dialogRef = this.dialog.open(ProductSubmitDialogComponent, {
      width: '100%',
      data: {
        billData: billData,
        tableNumber: this.tableNumber,
        checkComponent: false,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAllProducts();
      }
    });
  }

  filterTables(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.filteredTables = this.tableList.filter((table) =>
      table.toLowerCase().includes(filterValue)
    );
  }

  deleteProduct(id: number) {
    const userConfirmed = confirm('Are you sure you want to Delete?');
    if (userConfirmed) {
      this.productService.deleteProducts(id).subscribe({
        next: () => {
          this.snackbarService.showMessage('Product deleted!', 'success');
          window.location.href = '/dashboard';
        },
        error: () => {
          this.snackbarService.showMessage(
            'Deletion failed! Please try again.',
            'error'
          );
        },
      });
    }
  }

  updateProduct(product_id: any) {
    let param = this.dataSource.data.find((data: any) => {
      return data.product_id === product_id;
    });
    this.router.navigate(['dashboard/add-product'], { queryParams: param });
  }

  addNewItem() {
    this.router.navigate(['dashboard/add-product']);
  }

  createImageUrl(imageBlob: any): any {
    const byteCharacters = atob(imageBlob);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }

  changeQuantity(element: any, value: number): void {
    const productIndex = this.filteredData.data.findIndex(
      (p) => p.product_id === element.product_id
    );
    if (productIndex !== -1) {
      this.filteredData.data[productIndex]['quantity'] =
        element.quantity + value;
    }
  }

  onChangeTip(element: any, tip: any): void {
    const productIndex = this.filteredData.data.findIndex(
      (p) => p.product_id === element.product_id
    );
    if (productIndex !== -1) {
      this.filteredData.data[productIndex]['tip'] = tip.value;
    }
  }
  
  getOrders() {
    this.router.navigate(['/dashboard/order'], {
      queryParams: { table_no: this.tableNumber },
    });
  }

  getUserName() {
    return localStorage.getItem('userName');
  }
}
