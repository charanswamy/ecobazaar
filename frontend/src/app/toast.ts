import { Component } from '@angular/core';
import { NgIf } from '@angular/common';   // ⬅️ Import only NgIf instead of full CommonModule

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgIf],        // ⬅️ fixes *ngIf and no unused warning
  template: `
    <div *ngIf="show" class="toast">
      {{ message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.78);
      color: #fff;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      box-shadow: 0 4px 18px rgba(0,0,0,0.4);
      z-index: 99999;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class Toast {
  show = false;
  message = '';

  display(msg: string) {
    this.message = msg;
    this.show = true;
    setTimeout(() => (this.show = false), 3500);
  }
}
