import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { Subject, filter, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    NgIf
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {

  @Input() toggleTheme!: () => void;

  // MUST BE PUBLIC → used in template
  public auth = inject(AuthService);

  // Cart + Routing services
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  cartCount = 0;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateCartCountIfNeeded();

    // Refresh cart on login change
    this.auth.loggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateCartCountIfNeeded());

    // Refresh cart after navigation
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateCartCountIfNeeded());
  }

  private updateCartCountIfNeeded(): void {
    if (this.auth.isUser() && this.auth.isLoggedIn()) {
      this.loadCartCount();
      return;
    }
    this.cartCount = 0;
  }

  private loadCartCount(): void {
    this.cartService.getSummary().subscribe({
      next: (res: any) => {
        const items = res?.items;
        this.cartCount = Array.isArray(items) ? items.length : 0;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.cartCount = 0;
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
