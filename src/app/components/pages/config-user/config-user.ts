import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-config-user',
  imports: [CommonModule, FormsModule, Sidebar, ReactiveFormsModule],
  templateUrl: './config-user.html',
  styleUrl: './config-user.css'
})
export class ConfigUser {

  http = inject(HttpClient);
  selectedFile: File | null = null;
  fotoPreview: string | null = null;
  isEditingProfile: boolean = false;

  fb = inject(FormBuilder);
  form = this.fb.group({
    logradouro: new FormControl(''),
    numero: new FormControl(''),
    complemento: new FormControl(''),
    bairro: new FormControl(''),
    cidade: new FormControl(''),
    estado: new FormControl(''),
    cep: new FormControl(''),
    telefone: new FormControl('')
  });
  // Backup para cancelar edição
 

  nomeUsuario = signal('');
  emailUser = signal('');
  cpfUser = signal('');
  fotoUser = signal('');
  // Toast
  toastVisible: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';

  ngOnInit(): void {

    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);
    

    this.http.get(`${environment.apiUser}/buscar-usuario/${user.id}`)
    .subscribe({
      next: (resp: any) => {
        
        this.nomeUsuario.set(resp.dados.nomeCompleto)
        this.emailUser.set(resp.email)
        this.cpfUser.set(resp.dados.cpf);

        this.form.patchValue({
          logradouro: resp.dados.endereco.logradouro,
          numero: resp.dados.endereco.numero,
          complemento: resp.dados.endereco.complemento,
          bairro: resp.dados.endereco.bairro,
          cep: resp.dados.endereco.cep,
          cidade: resp.dados.endereco.cidade,
          estado: resp.dados.endereco.estado,
          telefone: resp.dados.telefone
        });
      
        this.http.get(`${environment.apiUser}/foto-perfil/${user.id}`, { responseType: 'blob', headers: {Authorization: `Bearer ${user.token}`}})
        .subscribe({
          next: (resp : Blob) => {
            
            const reader = new FileReader();

            reader.onload = () => {
              this.fotoUser.set(reader.result as string);
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

  }

cepKeyUp(event: KeyboardEvent) {
    const cep = event.target as HTMLInputElement;
    this.http.get(`${environment.apiEndereco}?cep=${cep.value}`,)
      .subscribe({
        next: (resp: any) => {
          this.form.patchValue({
                logradouro: resp.logradouro,
                bairro: resp.bairro,
                cidade: resp.localidade,
                estado: resp.estado
            
          });
        
        },
        error: (e) => {
          console.log('CEP não encontrado...' + e.error.message);
        }
      });
  }

    oneFileSelected(event: any) {
    const file = event.target.files[0];

    if(file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e : any) => {
        this.fotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getFilePreview(file: File): string {
  return URL.createObjectURL(file);
  }


  editInfo() {
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);

    if(this.selectedFile) {
      const formData = new FormData();
      formData.append('file',this.selectedFile);
      this.http.patch(`${environment.apiUser}/alterar-foto`,formData, {headers: {Authorization: `Bearer ${user.token}`}})
      .subscribe({
        next: (resp : any) => {
          console.log(resp)
        },
        error: (e) => {
          console.log(e.error.message);
        }
      })
    }
    
    console.log(this.form.value)
     this.http.put(`${environment.apiUser}/editar-info`, this.form.value, {headers: {Authorization: `Bearer ${user.token}`}})
      .subscribe({
        next: (resp : any) => {
          console.log(resp);
          
        },
        error: (e) => {
          console.log(e.error.message);
        }
      }); 
      
      this.handleSaveProfile();
    

  }

  startEditingProfile(): void {

    this.isEditingProfile = true;
  }

  handleSaveProfile(): void {
    this.showToast('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
    this.isEditingProfile = false;
  
  }

  handleCancelEdit(): void {
    this.isEditingProfile = false;
  }

  handleAddPaymentMethod(): void {
    this.showToast('Adicionar forma de pagamento', 'Funcionalidade em desenvolvimento.');
  }

  handleRemovePaymentMethod(id: string): void {
    this.showToast('Forma de pagamento removida', 'A forma de pagamento foi excluída.');
  }

  getPaymentMethodDetails(): void {
    

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
