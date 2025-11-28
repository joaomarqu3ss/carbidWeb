import { CommonModule } from '@angular/common';
import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

  carro = signal<any>(null);
  id = signal<string>('');
  fotos = signal<string[]>([]);
  vendedor = signal<any>(null);
  fotoVendedor = signal('');

  // Toast
  toastVisible: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
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
                // console.log(this.vendedor())

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
