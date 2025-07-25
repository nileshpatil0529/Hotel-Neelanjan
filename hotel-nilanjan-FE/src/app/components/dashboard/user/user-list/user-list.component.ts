import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'userName', 'createDate', 'action'];
  dataSource = [];

  constructor(private userService: UserService, private router: Router, private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.dataSource = users;
    });
  }

  deleteUser(element: any) {
    const userConfirmed = confirm('Are you sure you want to proceed?');
    if (userConfirmed) {
      this.userService.deleteUser(element.id).subscribe({
        next: () => {
          this.snackbarService.showMessage('User Deleted Successfully!', 'success');
          this.getAllUsers();
        },
        error: (err) => {
          this.snackbarService.showMessage('Failed to Delete! Please try again.', 'error');
        }
      });
    }
  }

  addUser() {
    this.router.navigate(['dashboard/add-user']);
  }
}
