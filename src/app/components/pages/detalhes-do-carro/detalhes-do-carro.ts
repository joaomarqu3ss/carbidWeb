import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Sidebar } from "../../shared/sidebar/sidebar";

interface CarDetails {
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cor: string;
  imagens: string[];
  descricao: string;
  detalhes: {
    combustivel: string;
    transmissao: string;
    motor: string;
    portas: string;
    final_placa: string;
  };
  opcionais: string[];
  vendedor: {
    nome: string;
    foto: string;
    telefone: string;
    email: string;
  };
}

@Component({
  selector: 'app-detalhes-do-carro',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Sidebar],
  templateUrl: './detalhes-do-carro.html',
  styleUrl: './detalhes-do-carro.css'
})
export class DetalhesDoCarro {

  car: CarDetails | null = null;
  currentImageIndex: number = 0;
  showContactDialog: boolean = false;
  
  // Toast
  toastVisible: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';

  // Mock data - em produção viria de uma API
  private carDetailsData: { [key: number]: CarDetails } = {
    1: {
      marca: 'Toyota',
      modelo: 'Corolla XEI',
      ano: 2023,
      preco: 145000,
      km: 15000,
      cor: 'Prata',
      imagens: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
      ],
      descricao: 'Corolla XEI 2.0 em perfeito estado de conservação. Único dono, todas as revisões feitas na concessionária. Aceito propostas.',
      detalhes: {
        combustivel: 'Flex',
        transmissao: 'Automático CVT',
        motor: '2.0 16V',
        portas: '4 portas',
        final_placa: '5'
      },
      opcionais: [
        'Ar-condicionado digital',
        'Central multimídia',
        'Câmera de ré',
        'Sensor de estacionamento',
        'Piloto automático',
        'Bancos em couro'
      ],
      vendedor: {
        nome: 'Carlos Silva',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        telefone: '(11) 98765-4321',
        email: 'carlos.silva@email.com'
      }
    },
    2: {
      marca: 'Honda',
      modelo: 'Civic Touring',
      ano: 2022,
      preco: 165000,
      km: 28000,
      cor: 'Preto',
      imagens: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800'
      ],
      descricao: 'Honda Civic Touring top de linha, extremamente conservado. Segundo dono, manual e chave reserva. Ipva 2024 pago.',
      detalhes: {
        combustivel: 'Gasolina',
        transmissao: 'Automático CVT',
        motor: '1.5 Turbo',
        portas: '4 portas',
        final_placa: '7'
      },
      opcionais: [
        'Teto solar',
        'Bancos em couro',
        'Sistema de som premium',
        'Controle de cruzeiro adaptativo',
        'Frenagem automática',
        'Alerta de ponto cego'
      ],
      vendedor: {
        nome: 'Ana Santos',
        foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        telefone: '(11) 91234-5678',
        email: 'ana.santos@email.com'
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']) || 1;
      this.car = this.carDetailsData[id] || this.carDetailsData[1];
    });
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

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }

  previousImage(): void {
    if (this.car && this.car.imagens.length > 0) {
      this.currentImageIndex = 
        (this.currentImageIndex - 1 + this.car.imagens.length) % this.car.imagens.length;
    }
  }

  nextImage(): void {
    if (this.car && this.car.imagens.length > 0) {
      this.currentImageIndex = 
        (this.currentImageIndex + 1) % this.car.imagens.length;
    }
  }

  openContactDialog(): void {
    this.showContactDialog = true;
  }

  closeContactDialog(): void {
    this.showContactDialog = false;
  }

  handleContact(type: string): void {
    this.showToast(`Contato via ${type}`, `Abrindo ${type}...`);
    this.closeContactDialog();
  }

  handleProposal(): void {
    this.showToast('Fazer Proposta', 'Funcionalidade de propostas será implementada em breve.');
  }

  showToast(title: string, message: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVisible = true;
    
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
