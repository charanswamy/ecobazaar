import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {

  email = '';
  password = '';
  isLoggingIn = false;
  showPassword = false;  // 👁️ show/hide password

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // ---------------------------------------
  // INITIAL PAGE SETUP (apply login page styles)
  // ---------------------------------------
  ngOnInit(): void {
    document.body.classList.add('landing-navbar');
    document.body.classList.add('auth-bg');
  }

  // ---------------------------------------
  // CLEANUP (remove login-only classes)
  // ---------------------------------------
  ngOnDestroy(): void {
    document.body.classList.remove('landing-navbar');
    document.body.classList.remove('auth-bg');
    document.body.classList.remove('blur-active');
  }

  // ---------------------------------------
  // BLUR HANDLERS
  // ---------------------------------------
  activateBlur() {
    document.body.classList.add('blur-active');
  }

  deactivateBlur() {
    document.body.classList.remove('blur-active');
  }

  // ---------------------------------------
  // EYE TOGGLE
  // ---------------------------------------
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // ---------------------------------------
  // SUBMIT HANDLER
  // ---------------------------------------
  submit(form: NgForm) {
    if (form.invalid) {
      alert('Please enter valid email and password');
      return;
    }

    this.isLoggingIn = true;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoggingIn = false;

        // remove blur+styles before navigating
        document.body.classList.remove('blur-active');
        document.body.classList.remove('auth-bg');
        document.body.classList.remove('landing-navbar');

        const role = this.auth.getRole();

        if (role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin']);
        } 
        else if (role === 'ROLE_SELLER') {
          this.router.navigate(['/seller/dashboard']);
        } 
        else {
          this.router.navigate(['/dashboard']);
        }
      },

      error: (err) => {
        this.isLoggingIn = false;
        alert(err.error?.message || 'Login failed. Try again.');
      }
    });
  }
}
