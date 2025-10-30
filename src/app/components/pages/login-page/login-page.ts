import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {

  http = inject(HttpClient);
  router = inject(Router);

  fb = new FormBuilder()

  form = this.fb.group({
    email: ['', Validators.required],
    senha: ['', Validators.required]
  });


  ngOnInit() {
    const auth = sessionStorage.getItem('token');
    if (auth) {
      sessionStorage.removeItem('token')
    }

  }

  login() {

    this.http.post(`${environment.apiUser}/login`, this.form.value)
      .subscribe({
        next: (resp: any) => {

          sessionStorage.setItem('token', JSON.stringify(resp));
          this.router.navigate(['/dashboard']);

        },
        error: (e) => {
          console.log(e.error.message);
        }
      })

  }

}
