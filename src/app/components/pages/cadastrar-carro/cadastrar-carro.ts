import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from "../../shared/sidebar/sidebar";



@Component({
  selector: 'app-cadastrar-carro',
  imports: [CommonModule, ReactiveFormsModule, Sidebar, FormsModule],
  templateUrl: './cadastrar-carro.html',
  styleUrl: './cadastrar-carro.css'
})
export class CadastrarCarro {
fotos: string[] = [];
files: File[] = [];
fb = inject(FormBuilder);
// {
//   "nome": "Onix Plus 1.0 Turbo",
//   "marca": "Chevrolet",
//   "modelo": "LTZ",
//   "ano": 2023,
//   "cor": "Branco",
//   "tipo": "Sedan",
//   "direcao": "Elétrica",
//   "transmissao": "Manual",
//   "motor": "1.4 Turbo",
//   "portas": 4,
//   "quilometragem": 8500,
//   "placa": "7",
//   "combustivel": "Flex",
//   "opcionais": "Airbag,ABS,Multimídia,Câmera de Ré",
//   "descricao": "Veículo praticamente novo, todas as revisões em concessionária.",
//   "preco": 92500.00,
//   "tipoDeVenda": "Vender"
// }
form = this.fb.group({
    nome: ['',[Validators.required]],
    marca: ['',[Validators.required]],
    modelo: ['',[Validators.required]],
    ano: ['',[Validators.required]],
    cor: ['',[Validators.required]],
    tipo: ['',[Validators.required]],
    direcao: ['',[Validators.required]],
    transmissao: ['',[Validators.required]],
    motor: ['',[Validators.required]],
    portas: ['',[Validators.required]],
    quilometragem: ['',[Validators.required]],
    placa: ['',[Validators.required]],
    combustivel: ['',[Validators.required]],
    opcionais: ['', [Validators.required]],
    descricao: ['',[Validators.required]],
    preco: ['',[Validators.required]],
    tipoDeVenda: ['',[Validators.required]]
})
  
  // Form fields
  marca: string = '';
  modelo: string = '';
  ano: number | null = null;
  cor: string = '';
  km: number | null = null;
  tipo: string = '';
  preco: number | null = null;
  combustivel: string = '';
  descricao: string = '';
  
  // Opcionais
  opcionais = {
    arCondicionado: false,
    direcaoEletrica: false,
    vidrosEletricos: false,
    travasEletricas: false,
    airbag: false,
    abs: false,
    cameraRe: false,
    sensorEstacionamento: false,
    multimidia: false,
    bancosCouro: false,
    tetoSolar: false,
    controleTracao: false
  };

  // Toast
  toastVisible: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';

  constructor(private router: Router) {}

  onFileSelected() {
    // PEGAR FOTOS
  }

  onSumbit() {
    // ENVIAR FORMULARIO

  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    
    // Validação básica
    if (!this.marca || !this.modelo || !this.ano || !this.cor || !this.km || !this.tipo || !this.preco || !this.combustivel) {
      this.showToast('Campos obrigatórios', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Aqui será implementada a lógica de cadastro no backend
    this.showToast('Carro cadastrado!', 'Seu anúncio foi criado com sucesso.');
    
    setTimeout(() => {
      this.router.navigate(['/meus-carros']);
    }, 1500);
  }

  handleAddFoto(): void {
    // Simulação de upload - será substituído por upload real
    const novaFoto = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1621007947382' : '1606664515524'}-bb3c3994e3fb?w=800&auto=format&fit=crop`;
    
    if (this.fotos.length < 10) {
      this.fotos.push(novaFoto);
    } else {
      this.showToast('Limite de fotos', 'Você pode adicionar no máximo 10 fotos');
    }
  }

  handleRemoveFoto(index: number): void {
    this.fotos = this.fotos.filter((_, i) => i !== index);
  }

  voltar(): void {
    this.router.navigate(['/meus-carros']);
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
