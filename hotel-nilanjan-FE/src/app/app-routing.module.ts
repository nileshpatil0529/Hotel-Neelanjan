import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { AuthGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProductListComponent } from './components/dashboard/product/product-list/product-list.component';
import { AddProductComponent } from './components/dashboard/product/add-product/add-product.component';
import { UserListComponent } from './components/dashboard/user/user-list/user-list.component';
import { AddUserComponent } from './components/dashboard/user/add-user/add-user.component';
import { BillHistoryComponent } from './components/dashboard/product/bill-history/bill-history.component';
import { OrderComponent } from './components/dashboard/order/order.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard/product-list', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], children: [
    { path: '', redirectTo: 'product-list', pathMatch: 'full'},
    {path: 'product-list', component: ProductListComponent},
    {path: 'add-product', component: AddProductComponent},
    {path: 'user-list', component: UserListComponent},
    {path: 'add-user', component: AddUserComponent},
    {path: 'bill-history', component: BillHistoryComponent},
    {path: 'order', component: OrderComponent},
  ] },
  { path: 'update-password/:id', component: UpdatePasswordComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
