import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Signal, signal } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-favorite-cars',
  imports: [CommonModule, Sidebar],
  templateUrl: './favorite-cars.html',
  styleUrl: './favorite-cars.css'
})
export class FavoriteCars {

  carros = signal<any[]>([]);
  fotoCapa = signal<Record<string,string>>({});

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);
    this.http.get(`${environment.apiCarbid}/perfil/favoritos`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.carros.set(resp);

        if(resp !== null) {
          resp.forEach((carro : any) => {
            this.http.get<string[]>(`${environment.apiCarbid}/carro/fotos/${carro.id}`, {headers: {Authorization: `Bearer ${user.token}`}})
            .subscribe(fotos => {
              if(fotos && fotos.length > 0) {
                const foto1 = fotos[0];

                this.fotoCapa.update(currentMap => {
                  return {
                    ...currentMap,
                    [carro.id]: foto1
                  };
                });
              }
            });
          });
        }
      },
      error: (e) => {
        console.log(e.error.message);
      }
    })
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatKm(km: number): string {
    return new Intl.NumberFormat('pt-BR').format(km);
  }
  
  handleViewDetails(id: string): void {
    const car = this.carros().find(c => c.id === id);
    if (car) {
      this.router.navigate([`/detalhes-do-carro/${id}`]);
    }
  }

  desfavoritar(id : string) {
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);
    this.http.patch(`${environment.apiCarbid}/carro/desfavoritar/${id}`, null, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: (e) => {
        console.log(e.error.message)
      }
    })
  }
}
