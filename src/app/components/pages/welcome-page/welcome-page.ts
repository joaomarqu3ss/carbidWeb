import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome-page',
  imports: [],
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.css'
})
export class WelcomePage {

  router = inject(Router);

  ngOnInit() {
    const auth = sessionStorage.getItem('token');
    if (auth) {
      sessionStorage.removeItem('token')
    }
  }

  vamosComecar() {
    this.router.navigate(['/register']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
