import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html'
  // <-- no styleUrls since you're using global styles.scss only
})
export class Home implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Exposed observable for template async pipe
  loggedIn$ = this.auth.loggedIn$;

  ngOnInit(): void {
    document.body.classList.add('landing-bg');
    document.body.classList.add('landing-layout');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('landing-bg');
    document.body.classList.remove('landing-layout');
  }

  goToDashboard() {
    const role = this.auth.getRole();
    if (!role) return this.router.navigateByUrl('/login');

    if (role === 'ROLE_ADMIN') return this.router.navigateByUrl('/admin');
    if (role === 'ROLE_SELLER') return this.router.navigateByUrl('/seller/dashboard');
    return this.router.navigateByUrl('/dashboard');
  }
}
