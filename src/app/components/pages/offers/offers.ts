import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ChatSocketService } from '../../chat-service/chat-socket.service';
import { ChatHistoryResponse } from '../../chat-service/dtos/mensagem-request';
import { connect, Subscription, timestamp } from 'rxjs';
import { PropostaAtualResponse } from './dtos/ PropostaAtualResponse';
import { PropostaResponse } from './dtos/PropostaResponse';
import { ChatService } from '../../chat-service/chat-service';

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

 offers = signal<any[]>([]);
 offer: PropostaAtualResponse | null = null;
 
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
  
 propostaSelecionada: any = null
  recipient: string = ''
  novaMensagem: string = '';
  mensagensAtuais: any[] = [];
  mensagensMap: Record<string, Mensagem[]> = {};
  router = inject(Router);
  http = inject(HttpClient);
  fotoVendedor = signal('');
  
  // Toast
  toastVisible = signal<boolean>(false);
  toastTitle: string = '';
  toastMessage: string = '';
  toastVariant: 'success' | 'error' = 'success';
  
  loading = signal<boolean>(false);
  idUsuario = signal('');
  idVendedor = signal('');
  idComprador = signal('')
  
  sender = signal('');
  receiverId: string = ''


  // TOKEN
  private getHeaderToken() {
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);

    return {
      Authorization: `Bearer ${user.token}`
    }
  }

  //CHAT SETTINGS
  historico: any[] = [];
  historico2 = signal<any[]>([])

  private chatSub?: Subscription;

  constructor(
    private chatSocket: ChatSocketService,
    private chatService: ChatService
  ) {}
  
  ngOnInit(): void {

    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);
    
    this.chatSocket.connect()

    this.chatSocket.message$.subscribe(message => {
      if(message) {
        console.log('Recebeu amor');

        this.historico2.update(values => {
          return [...values,message]
        })
      }
    })

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
    });

    

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

  // listMessages() {
  // }

  get propostaAtual(): PropostaAtualResponse | null {
    const auth = sessionStorage.getItem('token')
    const user = JSON.parse(auth as string)



      if(this.propostaSelecionada){
        

        if(this.visualizacao === 'recebidas'){
          this.http.get(`${environment.apiCarbid}/offer/${this.propostaSelecionada}`,{headers: this.getHeaderToken()})
          .subscribe({
        next: (resp : any) => {
        this.idVendedor.set(resp.usuarioId)
        this.idComprador.set(resp.usuarioId)
        if(resp.aceita == true) {
          this.statusOffer = 'Aceita'
        } else if (resp.aceita == false && resp.recusada == false) {
          this.statusOffer = 'Pendente'
        } else {
          this.statusOffer = 'Recusada'
        }

        this.http.get(`${environment.apiUser}/buscar-usuario/${resp.usuarioId}`, {headers: this.getHeaderToken()})
        .subscribe((resp : any) => {
          this.nomeComprador.set(resp.dados.nomeCompleto);
        })

        this.http.get(`${environment.apiUser}/foto-perfil/${resp.usuarioId}`, {responseType: 'blob'})
                  .subscribe({
                    next : (resp : Blob) => {
                      const reader = new FileReader()

                      reader.onload  = () => {
                        this.fotoVendedor.set(reader.result as string);
                      }
                      reader.readAsDataURL(resp);
                    },
                    error: (e) => {
                      console.log(e.error.message);
                    }
                  }); 
      },
      error: (e) => {
        console.log(e.error.message)
      }
      });
      return {
        id: this.propostaSelecionada,
        nomeDoCarro: this.nomeCarro(),
        fotoComprador: this.fotoVendedor(),
        status: this.statusOffer,
        nomeComprador: this.nomeComprador(),
        compradorId: this.idComprador(),
        vendedorId: user.id
      }
    }
    else {
      
      this.http.get(`${environment.apiCarbid}/offer/${this.propostaSelecionada}`,{headers: this.getHeaderToken()})
        .subscribe({
          next: (resp : any) => {
          const id = resp.vendedorId;
          this.idVendedor.set(id)
          
          if(resp.aceita == true) {
            this.statusOffer = 'Aceita'
          } else if (resp.aceita == false && resp.recusada == false) {
            this.statusOffer = 'Pendente'
          } else {
            this.statusOffer = 'Recusada'
          }

          this.http.get(`${environment.apiUser}/buscar-usuario/${resp.vendedorId}`, {headers: this.getHeaderToken()})
          .subscribe({
            next : (resp : any) => {
                this.nomeComprador.set(resp.dados.nomeCompleto)
            },error: (e) => {
              console.log(e.error.message)
            }
          })

          this.http.get(`${environment.apiUser}/foto-perfil/${id}`, {responseType: 'blob'})
                    .subscribe({
                      next : (resp : Blob) => {
                        const reader = new FileReader()

                        reader.onload  = () => {
                          this.fotoVendedor.set(reader.result as string);
                        }
                        reader.readAsDataURL(resp);
                      },
                      error: (e) => {
                        console.log(e.error.message);
                      }
                    }); 
        },
        error: (e) => {
          console.log(e.error.message)
        }
      
        });

        return {
          id: this.propostaSelecionada,
          nomeDoCarro: this.nomeCarro(),
          fotoComprador: this.fotoVendedor(),
          status: this.statusOffer,
          nomeComprador: this.nomeComprador(),
          compradorId: user.id,
          vendedorId: this.idVendedor()
        }
  }
  }
    return null; 
  }

  get listaAtual(): any[] {
    return this.visualizacao === 'recebidas' ? this.offers() : this.myOffers();
  }


  selecionarProposta(id: string): void {
    this.propostaSelecionada = id
  
    this.verifyRecipient(this.propostaSelecionada)  
    
  }

  verifyRecipient(id : string): string {
    if(this.visualizacao === 'recebidas') {
      this.http.get(`${environment.apiCarbid}/offer/${id}`, {headers : this.getHeaderToken()})
      .subscribe({
        next: (resp : any) => {
          this.receiverId = resp.usuarioId

          this.chatService.
          buscarHistorico(this.idUsuario(), this.receiverId)
          .subscribe({
            next: (msgs) => {
              console.log('Loading messages...')
              console.log(msgs)
              this.historico2.set(msgs)
            },
            error: (e) => {
              console.log(e.error)
            }
          });
        },
        error: (e) => {
          console.log(e.error.message)
        }
      })
    } else {
      this.http.get(`${environment.apiCarbid}/offer/${id}`, {headers: this.getHeaderToken()})
      .subscribe({
        next: (resp : any) => {
          this.receiverId = resp.vendedorId

          this.chatService.
          buscarHistorico(this.idUsuario(), this.receiverId)
          .subscribe({
            next: (msgs) => {
              console.log(msgs)
              this.historico2.set(msgs)
            },
            error: (e) => {
              console.log(e.error)
            }
          });
        }
      });
    }

    return this.receiverId;
  }

 

  alternarVisualizacao(tipo: 'recebidas' | 'enviadas'): void {
    const auth = sessionStorage.getItem('token')
    const user = JSON.parse(auth as string);
    this.visualizacao = tipo;
    if(tipo === 'enviadas') {
      this.http.get(`${environment.apiCarbid}/offer/sends`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
        next: (resp : any) => {

          // INVERTER O ID DE VENDEDOR PARA COMPRADOR
          this.myOffers.set(resp)
          for(const offer of this.myOffers()) {
            this.fotosCarroProposta(offer.carroId);
            this.http.get(`${environment.apiCarbid}/carro/disponiveis/${offer.carroId}`, {headers: {Authorization: `Bearer ${user.token}`}})
            .subscribe((c : any) => {
              
            this.nomeCarro.set(c.nome)
          });
          }
        },
        error: (e) => {
          console.log(e.error.message);
        }
    });
    }
    else {
      this.http.get(`${environment.apiCarbid}/offer/all`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.offers.set(resp);
        for(const offer of this.offers()) {
          this.http.get(`${environment.apiUser}/buscar-usuario/${offer.usuarioId}`, {headers: {Authorization: `Bearer ${user.token}`}})
          .subscribe( (comprador : any) => {
            this.nomeComprador.set(comprador.dados.nomeCompleto)
            this.idVendedor.set(comprador.id)
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
    }
  }

  fecharChat(): void {
    this.propostaSelecionada = null;
  }

  handleEnviarMensagem(): void {
   if (!this.novaMensagem.trim() || !this.propostaAtual) return;
    
   const recipient = this.verifyRecipient(this.propostaAtual.id);

    const message = {
      offerId: this.propostaSelecionada,
      senderId: this.idUsuario(),
      recipientId: recipient,
      content: this.novaMensagem
    }
    
    this.chatSocket.sendMessage(message);

    this.historico2.update(msgs => {
      return [...msgs,message]
    })

  
   
    this.novaMensagem = '';
  }

  handleAceitarProposta(id: string): void {
    const lista = this.visualizacao === 'recebidas' ? this.offers() : this.myOffers();
    const index = lista.findIndex(p => p.id === id);
    if (index !== -1) {
      lista[index] = { ...lista[index], status: 'aceita' as const, naoLida: false };
    }
    this.showToast('Proposta aceita!', 'O comprador será notificado.', 'success');
  }

  handleRecusarProposta(id: string): void {
    const lista = this.visualizacao === 'recebidas' ? this.offers() : this.myOffers();
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

  ngOnDestroy() {
    this.chatSub?.unsubscribe();
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
