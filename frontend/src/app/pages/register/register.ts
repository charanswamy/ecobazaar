import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

type RegControls = {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register implements OnInit, OnDestroy {

  regForm: FormGroup<RegControls>;
  submitted = false;
  isSubmitting = false;

  showPassword = false; // 👁️ password toggle

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public router: Router,
    private toastr: ToastrService
  ) {
    this.regForm = this.fb.group({
      name: this.fb.nonNullable.control('', Validators.required),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  // Access controls easily
  t = <K extends keyof RegControls>(key: K) => this.regForm.controls[key];

  ngOnInit(): void {
    document.body.classList.add('landing-navbar');
    document.body.classList.add('auth-bg');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('landing-navbar');
    document.body.classList.remove('auth-bg');
    document.body.classList.remove('blur-active');
  }

  activateBlur() {
    document.body.classList.add('blur-active');
  }

  deactivateBlur() {
    document.body.classList.remove('blur-active');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.submitted = true;

    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      this.toastr.warning('Please fix the errors and try again.');
      return;
    }

    this.isSubmitting = true;

    this.auth.register(this.regForm.getRawValue()).subscribe({
      next: () => {
        this.toastr.success('Welcome to EcoBazaar! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Registration failed. Please try again.';
        this.toastr.error(msg);
      },
      complete: () => this.isSubmitting = false
    });
  }
}
