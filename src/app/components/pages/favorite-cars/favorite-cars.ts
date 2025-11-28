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

  handleFavorite(id: string): void {
    const car = this.carros().find(c => c.id === id);
    
  }

  handleViewDetails(id: string): void {
    const car = this.carros().find(c => c.id === id);
    if (car) {
      this.router.navigate([`/detalhes-do-carro/${id}`]);
    }
  }
}
