import { CommonModule } from '@angular/common';
import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-detalhes-do-carro',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Sidebar],
  templateUrl: './detalhes-do-carro.html',
  styleUrl: './detalhes-do-carro.css'
})
export class DetalhesDoCarro {
 
  currentImageIndex: number = 0;
  showContactDialog: boolean = false;
  showPropostaDialog: boolean = false;
    valorProposta: string = '';
    vendedorIdExits = signal(false);

  carro = signal<any>(null);
  id = signal<string>('');
  fotos = signal<string[]>([]);
  vendedor = signal<any>(null);
  idVendedor = signal('');
  fotoVendedor = signal('');
   fb = inject(FormBuilder);
  form = this.fb.group({
    valor: ['',[Validators.required]]
  })

  // Toast
  toastVisible = signal<boolean>(false);
  toastTitle: string = '';
  toastMessage: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {

    
    const auth = sessionStorage.getItem('token')
    const user = JSON.parse(auth as string);

    const idParam = this.route.snapshot.params['id'];
    if(idParam) {
      this.id.set(idParam)
      this.http.get(`${environment.apiCarbid}/carro/disponiveis/${this.id()}`, {headers: {Authorization: `Bearer ${user.token}`}})
      .subscribe({
        next: (resp : any) => {
          if(resp) {

            this.http.get(`${environment.apiUser}/buscar-usuario/${resp.usuarioId}`, {headers: {Authorization: `Bearer ${user.token}`}})
            .subscribe({
              next: (resp : any) => {
                this.vendedor.set(resp);
                this.idVendedor.set(resp.id);

                if(user.id === resp.id) {
                  this.vendedorIdExits.set(true);
                }


                this.http.get(`${environment.apiUser}/foto-perfil/${resp.id}`, {responseType: 'blob'})
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
                }) 
              },
              error: (e) => {
                console.log(e.error.message);
              }
            })

            this.carro.set(resp);
            this.http.get(`${environment.apiCarbid}/carro/fotos/${this.id()}`, {headers: {Authorization: `Bearer ${user.token}`}})
            .subscribe((fotosCarro : any )=> {
                this.fotos.update(currentList => [...currentList, ...fotosCarro]); 
            });
          }

        },
        error: (e) => {
          console.log(e.error.message);
        }
      })
    }


  }

  sendOffer() {
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string)

    const idParam = this.route.snapshot.params['id'];
    this.http.post(`${environment.apiCarbid}/offer/enviar/${idParam}`, this.form.value, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
          
          
          this.showToast('Proposta enviada!', 'O vendedor será notificado da sua proposta.');
          this.closePropostaDialog();
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

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }

  previousImage(): void {
    if (this.fotos().length > 0 && this.currentImageIndex > 0) {
      this.currentImageIndex = 
        (this.currentImageIndex - 1) % this.fotos().length;
    }
  }

  nextImage(): void {
    if (this.fotos().length > 0) {
      this.currentImageIndex = 
        (this.currentImageIndex + 1) % this.fotos().length;
    }
  }


  openPropostaDialog(): void {
    this.showPropostaDialog = true;
  }

  closePropostaDialog(): void {
    this.showPropostaDialog = false;
    this.valorProposta = '';
  }

  handleValorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value) {
      const numValue = parseInt(value) / 100;
      this.valorProposta = numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    } else {
      this.valorProposta = '';
    }
  }

  handleEnviarProposta(): void {
    if (!this.valorProposta) {
      this.showToast('Erro', 'Por favor, informe o valor da proposta');
      return;
    }

    // Aqui será implementada a lógica de envio da proposta ao backend
    this.showToast('Proposta enviada!', 'O vendedor será notificado da sua proposta.');
    this.closePropostaDialog();
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
    this.openPropostaDialog();
  }

  showToast(title: string, message: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVisible.set(true)
    
    setTimeout(() => {
      this.toastVisible.set(false);
    }, 3000);
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
