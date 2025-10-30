import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adm-controller',
  imports: [Sidebar, CommonModule],
  templateUrl: './adm-controller.html',
  styleUrl: './adm-controller.css'
})
export class AdmController {


  http = inject(HttpClient);
  users = signal<any[]>([]);
  router = inject(Router);

  ngOnInit() {

    this.http.get(`${environment.apiUser}/waiting-verify`)
    .subscribe({
      next: (resp : any) => {

        this.users.set(resp);

      },
      error: (e) => {
        console.log(e.error.message);
      }
    })
  }

  aprovar(id : string) {
    this.http.patch(`${environment.apiUser}/cadastros/verify/${id}`, null)
    .subscribe({
      next: (resp : any) => {

        this.ngOnInit();

      },
      error: (e) => {
        console.log(e.error.message);
      }
    })
  }

  maisInfo(id : string) {
      this.router.navigate(['/adm/cliente/', id])
  }
  

 

}
