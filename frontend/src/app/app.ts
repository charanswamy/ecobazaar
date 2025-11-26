import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Toast } from './toast';

@Component({
  selector: 'app-root',   
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule, Navbar, Footer,Toast],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {

  // Current title
  protected readonly title = signal('ecobazaar-frontend');

  // Read stored theme OR default to light
  isDark = signal(localStorage.getItem('theme') === 'dark');

  constructor() {
    this.applyTheme();   // Apply theme on app load
  }

  // Called from navbar when the 🌙 button is clicked
  toggleTheme() {
    this.isDark.update(v => !v);

    const theme = this.isDark() ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    this.applyTheme();
  }

  // Applies theme to <html data-theme="...">
  private applyTheme() {
    const theme = this.isDark() ? 'dark' : 'light';
    document.documentElement.setAttribute("data-theme", theme);
  }
}
