import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from "../../shared/sidebar/sidebar";

interface MeuCarro {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  imagem: string;
  status: 'venda' | 'aluguel';
}

@Component({
  selector: 'app-meus-carros',
  imports: [CommonModule, ReactiveFormsModule, Sidebar],
  templateUrl: './meus-carros.html',
  styleUrl: './meus-carros.css'
})
export class MeusCarros {
carros: MeuCarro[] = [];
  
  // Toast
  toastVisible: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Mock data - será substituído por dados reais do backend
    this.carros = [
      {
        id: 1,
        marca: 'Toyota',
        modelo: 'Corolla XEi',
        ano: 2023,
        preco: 125000,
        km: 15000,
        imagem: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
        status: 'venda'
      },
      {
        id: 2,
        marca: 'Honda',
        modelo: 'Civic Touring',
        ano: 2024,
        preco: 3500,
        km: 5000,
        imagem: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
        status: 'aluguel'
      }
    ];
  }

  formatPrice(price: number, status?: string): string {
    const statusToUse = status || '';
    if (statusToUse === 'aluguel') {
      return `R$ ${price.toLocaleString('pt-BR')}/mês`;
    }
    return `R$ ${price.toLocaleString('pt-BR')}`;
  }

  formatKm(km: number): string {
    return `${km.toLocaleString('pt-BR')} km`;
  }

  getStatusLabel(status: string): string {
    return status === 'venda' ? 'À Venda' : 'Aluguel';
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/cadastrar-carro']);
  }

  handleViewDetails(id: number): void {
    this.router.navigate([`/detalhes-do-carro/${id}`]);
  }

  handleEdit(id: number): void {
    this.router.navigate([`/editar-carro/${id}`]);
  }

  showToast(title: string, message: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVisible = true;
    
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

}
