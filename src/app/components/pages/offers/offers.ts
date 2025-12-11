import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ChatService } from '../../chat-service/chat-service';
import { ChatRoom } from '../../chat-service/models/chat-room.model';


interface Comprador {
  nome: string;
  avatar: string;
}

interface Proposta {
  id: string;
  carroNome: string;
  carroImagem: string;
  comprador: Comprador;
  valor: number;
  mensagem: string;
  data: string;
  status: 'pendente' | 'aceita' | 'recusada';
  naoLida: boolean;
}

interface Mensagem {
  id: string;
  remetente: 'vendedor' | 'comprador';
  texto: string;
  data: string;
}

@Component({
  selector: 'app-offers',
  imports: [CommonModule,Sidebar, FormsModule, ReactiveFormsModule],
  templateUrl: './offers.html',
  styleUrl: './offers.css'
})
export class Offers {
 propostas: Proposta[] = [];
 minhasPropostas: Proposta[] = [];
 offers = signal<any[]>([]);
 statusOffer: string = ''
 myOffers = signal<any[]>([]);
 nomeComprador = signal('');
 carros = signal<any[]>([]);
 lastWeek = signal('');
 pendings = signal('');
 accepts = signal(''); 
 nomeCarro = signal('');
 fotoCapa: WritableSignal<Record<string, string>> = signal({});
 visualizacao: 'recebidas' | 'enviadas' = 'recebidas';
  propostaSelecionada: string | null = null;
  novaMensagem: string = '';
  mensagensMap: Record<string, Mensagem[]> = {};
  router = inject(Router);
  http = inject(HttpClient);
 
  // Toast
  toastVisible = signal<boolean>(false);
  toastTitle: string = '';
  toastMessage: string = '';
  toastVariant: 'success' | 'error' = 'success';
  
  chatRooms = signal<ChatRoom[]>([]);
  loading = signal<boolean>(false);
  idUsuario = signal('');

  constructor(
    private chatService: ChatService
  ) {}

  ngOnInit(): void {

    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);
    
    // Mock data
    this.propostas = [
      {
        id: '1',
        carroNome: 'Toyota Corolla 2022',
        carroImagem: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
        comprador: {
          nome: 'João Silva',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao'
        },
        valor: 85000,
        mensagem: 'Gostaria de oferecer R$ 85.000 pelo veículo. Posso fechar negócio ainda hoje!',
        data: '2024-03-20T10:30:00',
        status: 'pendente',
        naoLida: true
      },
      {
        id: '2',
        carroNome: 'Honda Civic 2023',
        carroImagem: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
        comprador: {
          nome: 'Maria Santos',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
        },
        valor: 125000,
        mensagem: 'Boa tarde! Tenho interesse no veículo. Aceita R$ 125k?',
        data: '2024-03-19T15:20:00',
        status: 'pendente',
        naoLida: true
      },
      {
        id: '3',
        carroNome: 'Ford Mustang 2021',
        carroImagem: 'https://images.unsplash.com/photo-1584345604476-8ec5f8f16d00?w=400',
        comprador: {
          nome: 'Carlos Oliveira',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos'
        },
        valor: 280000,
        mensagem: 'Proposta de R$ 280.000 à vista.',
        data: '2024-03-18T09:15:00',
        status: 'aceita',
        naoLida: false
      }
    ];

    // Mock data - Propostas ENVIADAS (como comprador)
    this.minhasPropostas = [
      {
        id: '4',
        carroNome: 'BMW 320i 2021',
        carroImagem: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
        comprador: {
          nome: 'Pedro Vendedor',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro'
        },
        valor: 150000,
        mensagem: 'Ofereço R$ 150.000 pelo BMW. Estou interessado!',
        data: '2024-03-21T14:20:00',
        status: 'pendente',
        naoLida: false
      },
      {
        id: '5',
        carroNome: 'Audi A3 2022',
        carroImagem: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
        comprador: {
          nome: 'Ana Vendedora',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anaV'
        },
        valor: 135000,
        mensagem: 'Proposta de R$ 135.000 à vista.',
        data: '2024-03-20T11:00:00',
        status: 'aceita',
        naoLida: false
      },
      {
        id: '6',
        carroNome: 'Volkswagen Golf GTI 2020',
        carroImagem: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
        comprador: {
          nome: 'Roberto Silva',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto'
        },
        valor: 95000,
        mensagem: 'Tenho interesse. Posso pagar R$ 95.000.',
        data: '2024-03-17T16:45:00',
        status: 'recusada',
        naoLida: false
      }
    ];

    // Mock mensagens
    this.mensagensMap = {
      '1': [
        {
          id: '1',
          remetente: 'comprador',
          texto: 'Gostaria de oferecer R$ 85.000 pelo veículo. Posso fechar negócio ainda hoje!',
          data: '2024-03-20T10:30:00'
        }
      ],
      '2': [
        {
          id: '1',
          remetente: 'comprador',
          texto: 'Boa tarde! Tenho interesse no veículo. Aceita R$ 125k?',
          data: '2024-03-19T15:20:00'
        }
      ],
      '3': [
        {
          id: '1',
          remetente: 'comprador',
          texto: 'Proposta de R$ 280.000 à vista.',
          data: '2024-03-18T09:15:00'
        },
        {
          id: '2',
          remetente: 'vendedor',
          texto: 'Proposta aceita! Vamos prosseguir com a documentação.',
          data: '2024-03-18T10:00:00'
        },
        {
          id: '3',
          remetente: 'comprador',
          texto: 'Perfeito! Quando podemos nos encontrar?',
          data: '2024-03-18T10:15:00'
        }
      ],
      '4': [
        {
          id: '1',
          remetente: 'vendedor',
          texto: 'Ofereço R$ 150.000 pelo BMW. Estou interessado!',
          data: '2024-03-21T14:20:00'
        }
      ],
      '5': [
        {
          id: '1',
          remetente: 'vendedor',
          texto: 'Proposta de R$ 135.000 à vista.',
          data: '2024-03-20T11:00:00'
        },
        {
          id: '2',
          remetente: 'comprador',
          texto: 'Proposta aceita! Vamos fechar negócio.',
          data: '2024-03-20T11:30:00'
        }
      ],
      '6': [
        {
          id: '1',
          remetente: 'vendedor',
          texto: 'Tenho interesse. Posso pagar R$ 95.000.',
          data: '2024-03-17T16:45:00'
        },
        {
          id: '2',
          remetente: 'comprador',
          texto: 'Desculpe, mas não posso aceitar esse valor.',
          data: '2024-03-17T17:00:00'
        }
      ]
    };

    this.idUsuario.set(user.id);

    this.http.get(`${environment.apiCarbid}/offer/stats`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.lastWeek.set(resp.offersLastWeek);
        this.accepts.set(resp.accepts);
        this.pendings.set(resp.pendings);
      },
      error: (e) => {
        console.log(e.error.message)
      }
    })

    this.http.get(`${environment.apiCarbid}/offer/all`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.offers.set(resp);
        for(const offer of this.offers()) {
          this.http.get(`${environment.apiUser}/buscar-usuario/${offer.usuarioId}`, {headers: {Authorization: `Bearer ${user.token}`}})
          .subscribe( (comprador : any) => {
            this.nomeComprador.set(comprador.dados.nomeCompleto)
          });

          this.fotosCarroProposta(offer.carroId);
          
          this.http.get(`${environment.apiCarbid}/carro/disponiveis/${offer.carroId}`, {headers: {Authorization: `Bearer ${user.token}`}})
          .subscribe((c : any) => {
            this.nomeCarro.set(c.nome)
          });       

        }
      },
      error: (e) => {
        console.log(e.error.message)
      }
    })

    this.http.get(`${environment.apiCarbid}/offer/sends`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
        next: (resp : any) => {
        
          this.myOffers.set(resp)
          
          for(const offer of this.myOffers()) {
            this.fotosCarroProposta(offer.carro.id);
          }

        },
        error: (e) => {
          console.log(e.error.message);
        }
    })

  }

 fotosCarroProposta(id : string)  {
  const auth = sessionStorage.getItem('token');
  const user = JSON.parse(auth as string)
  this.http.get<any[]>(`${environment.apiCarbid}/carro/fotos/${id}`, {headers: {Authorization: `Bearer ${user.token}`}})
  .subscribe(fotos => {
    if(fotos && fotos.length > 0) {
      const fotoUrl = fotos[0];
      this.fotoCapa.update(currentMap => {
        return {
          ...currentMap,
          [id]: fotoUrl
        }
      })
    }
  });
 } 

  get propostaAtual(): Proposta | undefined {
    const lista = this.visualizacao === 'recebidas' ? this.propostas : this.minhasPropostas;
    return lista.find(p => p.id === this.propostaSelecionada);
  }

  get listaAtual(): any[] {
    return this.visualizacao === 'recebidas' ? this.offers() : this.myOffers();
  }

  get mensagensAtuais(): Mensagem[] {
    return this.propostaSelecionada ? this.mensagensMap[this.propostaSelecionada] || [] : [];
  }

  selecionarProposta(id: string): void {
    this.propostaSelecionada = id
  }

  alternarVisualizacao(tipo: 'recebidas' | 'enviadas'): void {
    this.visualizacao = tipo;
    this.propostaSelecionada = null;
  }

  fecharChat(): void {
    this.propostaSelecionada = null;
  }

  handleEnviarMensagem(): void {
    if (this.novaMensagem.trim() && this.propostaSelecionada) {
      const novaMsgObj: Mensagem = {
        id: Date.now().toString(),
        remetente: 'vendedor',
        texto: this.novaMensagem,
        data: new Date().toISOString()
      };

      if (!this.mensagensMap[this.propostaSelecionada]) {
        this.mensagensMap[this.propostaSelecionada] = [];
      }
      this.mensagensMap[this.propostaSelecionada].push(novaMsgObj);
      
      this.novaMensagem = '';
    }
  }

  handleAceitarProposta(id: string): void {
    const lista = this.visualizacao === 'recebidas' ? this.propostas : this.minhasPropostas;
    const index = lista.findIndex(p => p.id === id);
    if (index !== -1) {
      lista[index] = { ...lista[index], status: 'aceita' as const, naoLida: false };
    }
    this.showToast('Proposta aceita!', 'O comprador será notificado.', 'success');
  }

  handleRecusarProposta(id: string): void {
    const lista = this.visualizacao === 'recebidas' ? this.propostas : this.minhasPropostas;
    const index = lista.findIndex(p => p.id === id);
    if (index !== -1) {
      lista[index] = { ...lista[index], status: 'recusada' as const, naoLida: false };
    }
    this.showToast('Proposta recusada', 'O comprador será notificado.', 'error');
  }

  formatValor(valor: number): string {
    return `R$ ${valor.toLocaleString('pt-BR')}`;
  }

  formatData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatHora(data: string): string {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadChatRooms() {
    if(!this.idUsuario()) return;
    this.loading.set(true)
    this.chatService.listChatRoomsForUser(this.idUsuario())
    .subscribe({
      next: (rooms : any) => {
        this.chatRooms.set(rooms);
        this.loading.set(false)
      },
      error: (e) => {
        console.log(e.error.message);
        this.loading.set(false)
      }
    })
  }


  getInitials(id : string): any {
    
    const auth = sessionStorage.getItem('token')
    const user  = JSON.parse(auth as string);

    this.http.get(`${environment.apiUser}/buscar-usuario/${id}`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe( (resp : any) => {
      return resp.dados.nomeCompleto.charAt(0).toUpperCase();
    })
  }

  getStatusBadgeClass(aceita: any, recusada: any): string  {

    if(aceita === true) {
      this.statusOffer = 'Aceita'
      return 'badge-success'
    }
    if(aceita === false && recusada === false) {
      this.statusOffer = 'Pendente'
      return 'badge-warning'
    }
    
    else {
      this.statusOffer = 'Recusada'
      return 'badge-error'
    }

  }

  getStatusLabel(status : string) {
    if(status === 'Aceita') return 'Aceita'
    
    if(status === 'Pendente') return 'Pendente'

    return 'Recusada'
  }


  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.handleEnviarMensagem();
    }
  }

  showToast(title: string, message: string, variant: 'success' | 'error' = 'success'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVariant = variant;
    this.toastVisible.set(true)

    setTimeout(() => {
      this.toastVisible.set(false)
    }, 3000);
  }
}
