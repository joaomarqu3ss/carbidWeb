import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


export interface CarData {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cor: string;
  imagem: string;
  destaque?: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [Sidebar, CommonModule, FormsModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {
    
  router = inject(Router);
  http = inject(HttpClient);
  carros = signal<any[]>([]);
  id = signal<string>('');
  fotos = signal<any[]>([]);
  fotoCapa: WritableSignal<Record<string, string>> = signal({}); // map fotos -> id do carro
  

   cars: CarData[] = [];
  filteredCars: CarData[] = [];
  toastVisible = signal(false);
  toastMessage = signal('');
  toastTitle = signal('');

  // Filtros
  searchTerm = '';
  selectedMarca = '';
  selectedAnoMin = '';
  selectedAnoMax = '';
  selectedPrecoMin = '';
  selectedPrecoMax = '';
  selectedCor = '';
  showFilters = false;

  // Listas para dropdowns
  marcas: string[] = [];
  cores: string[] = [];
  anos: number[] = [];


  ngOnInit() {

    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);

    this.http.get<any[]>(`${environment.apiCarbid}/carro/disponiveis`, {headers : {Authorization: `Bearer ${user.token}`} })
    .subscribe({
      next: (resp : any) => {
        
      this.carros.set(resp);

    if (resp !== null) {
      resp.forEach((carro: any) => {

        this.http.get<string[]>(`${environment.apiCarbid}/carro/fotos/${carro.id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        .subscribe(fotos => {

          if (fotos && fotos.length > 0) {
            const urlDaFoto =  fotos[0]
            this.fotoCapa.update(currentMap => {
            return {
              ...currentMap,
              [carro.id]: urlDaFoto
            };
          });  // <-- ARMAZENA A FOTO PARA ESTE CARRO
          }

        });

      });
    }

      },
      error: (e) => {
        console.log(e.error.message);
      }
    });

    this.cars = [
      {
        id: 1,
        marca: "Toyota",
        modelo: "Corolla XEI",
        ano: 2023,
        preco: 145000,
        km: 15000,
        cor: "Prata",
        imagem: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
        destaque: true
      },
      {
        id: 2,
        marca: "Honda",
        modelo: "Civic Sport",
        ano: 2022,
        preco: 135000,
        km: 28000,
        cor: "Preto",
        imagem: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop"
      },
      {
        id: 3,
        marca: "Volkswagen",
        modelo: "Jetta GLI",
        ano: 2023,
        preco: 158000,
        km: 8000,
        cor: "Branco",
        imagem: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        destaque: true
      },
      {
        id: 4,
        marca: "Hyundai",
        modelo: "HB20S Diamond",
        ano: 2024,
        preco: 95000,
        km: 2000,
        cor: "Vermelho",
        imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
      },
      {
        id: 5,
        marca: "Chevrolet",
        modelo: "Onix Plus Premier",
        ano: 2023,
        preco: 89000,
        km: 12000,
        cor: "Cinza",
        imagem: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop"
      },
      {
        id: 6,
        marca: "Fiat",
        modelo: "Argo Trekking",
        ano: 2022,
        preco: 78000,
        km: 35000,
        cor: "Azul",
        imagem: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop"
      }
    ];

    this.filteredCars = [...this.cars];
    this.initializeFilterOptions();
  }

  initializeFilterOptions(): void {
    // Extrair marcas únicas
    this.marcas = [...new Set(this.cars.map(car => car.marca))].sort();
    
    // Extrair cores únicas
    this.cores = [...new Set(this.cars.map(car => car.cor))].sort();
    
    // Extrair anos únicos
    this.anos = [...new Set(this.cars.map(car => car.ano))].sort((a, b) => b - a);
  }

  applyFilters(): void {
    this.filteredCars = this.cars.filter(car => {
      const matchSearch = 
        car.marca.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        car.modelo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchMarca = !this.selectedMarca || car.marca === this.selectedMarca;
      
      const matchAnoMin = !this.selectedAnoMin || car.ano >= parseInt(this.selectedAnoMin);
      const matchAnoMax = !this.selectedAnoMax || car.ano <= parseInt(this.selectedAnoMax);
      
      const matchPrecoMin = !this.selectedPrecoMin || car.preco >= parseInt(this.selectedPrecoMin);
      const matchPrecoMax = !this.selectedPrecoMax || car.preco <= parseInt(this.selectedPrecoMax);
      
      const matchCor = !this.selectedCor || car.cor === this.selectedCor;

      return matchSearch && matchMarca && matchAnoMin && matchAnoMax && 
             matchPrecoMin && matchPrecoMax && matchCor;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedMarca = '';
    this.selectedAnoMin = '';
    this.selectedAnoMax = '';
    this.selectedPrecoMin = '';
    this.selectedPrecoMax = '';
    this.selectedCor = '';
    this.filteredCars = [...this.cars];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
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
     const auth = sessionStorage.getItem('token');
     const user = JSON.parse(auth as string);
    this.http.post(`${environment.apiCarbid}/carro/favoritar/${id}`,null, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.showToast(
        'Adicionado aos Favoritos',
        resp
      );
      },
      error: (e) => {
        console.log(e.error.message);
      }
    });
  }

  handleViewDetails(id: string): void {
    const car = this.carros().find(c => c.id === id);
    if (car) {
      this.showToast(
        'Ver Detalhes',
        `Abrindo detalhes de ${car.marca} ${car.modelo}`
      );
      this.router.navigate([`/detalhes-do-carro/${id}`]);
    }
  }

  showToast(title: string, message: string): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastVisible.set(true);

    setTimeout(() => {
      this.toastVisible.set(false);
    }, 3000);
  }
}
