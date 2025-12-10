import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-meus-carros',
  imports: [CommonModule, ReactiveFormsModule, Sidebar],
  templateUrl: './meus-carros.html',
  styleUrl: './meus-carros.css'
})
export class MeusCarros {

cars = signal<any[]>([]);
fotoCapa = signal<Record<string, string>>({})
  // Toast
  toastVisible = signal<boolean>(false);
  toastTitle: string = '';
  toastMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);

    this.http.get(`${environment.apiCarbid}/carro?pagina=0&tamanho=10&ordenarPor=id&direcao=ASC`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        
        this.cars.set(resp);
        if(resp.length > 0){
          resp.forEach((carros : any) => {
            this.http.get<any[]>(`${environment.apiCarbid}/carro/fotos/${carros.id}`, {headers: {Authorization: `Bearer ${user.token}`}})
            .subscribe(fotos => {
              const foto1 = fotos[0];
              this.fotoCapa.update(currentMap => {
                return {
                  ...currentMap,[carros.id]: foto1
                }
              });
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
    return `${km.toLocaleString('pt-BR')} km`;
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/cadastrar-carro']);
  }

  handleViewDetails(id: string): void {
    this.router.navigate([`/detalhes-do-carro/${id}`]);
  }

  handleEdit(id: string): void {
    this.router.navigate([`/editar-carro/${id}`]);
  }

  showToast(title: string, message: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVisible.set(true)
    
    setTimeout(() => {
      this.toastVisible.set(false)
    }, 3000);
  }

}
