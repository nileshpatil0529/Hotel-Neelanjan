import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  imageFile: File | null = null;
  updateFormData: any = '';
  err: any = '';

  @Input() productData!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
  ) {
    this.productForm = this.fb.group({
      product_name: ['', Validators.required],
      marathi: ['', Validators.required],
      product_price: [0, [Validators.required, Validators.min(1)]],
      image: [null],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params && Object.keys(params).length > 0) {
        this.updateFormData = params;
        if (this.updateFormData) {
          this.productForm.setValue({
            product_name: this.updateFormData.product_name,
            marathi: this.updateFormData.marathi,
            product_price: this.updateFormData.product_price,
            image: this.updateFormData.image || null,
          });
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0]; // Store the selected file
      this.productForm.patchValue({ image: this.imageFile });
      this.productForm.get('image')?.updateValueAndValidity();
    }
  }

  // create and Update product data
  onSubmitUpdate(): void {
    if (this.productForm.valid) {
      const productData = {
        ...this.productForm.value,
        image: this.imageFile || this.updateFormData.image,
        product_id: this.updateFormData.product_id || null,
      };
      this.productService
        .createNupdateProduct(productData, !!this.updateFormData)
        .subscribe({
          next: () => {
            this.snackbarService.showMessage('Product added Successfully!', 'success');
            this.router.navigate(['dashboard/product-list']);
          },
          error: (error: any) => {
            this.err = error.error.message;
            this.snackbarService.showMessage(this.err, 'error');
          },
        });
    } else {
      console.error('Form is invalid or image file is missing.');
    }
  }

  cancel() {
    this.router.navigate(['dashboard']);
  }
}
