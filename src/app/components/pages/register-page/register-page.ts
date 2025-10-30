import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage {

  router = inject(Router);
  http = inject(HttpClient);
  fb = new FormBuilder();
  selectedFile: File | null = null;
  fotoPreview: string | null = null;
  mensagemSucesso = signal<boolean>(false)
  mensagem200 = signal('');
  mensagem400 = signal('');
  mensagemErro = signal<boolean>(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8)]],
    dadosPessoais: this.fb.group({
      nomeCompleto: ['', Validators.required],
      telefone: ['', Validators.required],
      cpf: ['', Validators.required],
      dataNascimento: ['',Validators.required],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', Validators.required],
        cep: ['', Validators.required]
      })
    })
  });

  cepKeyUp(event: KeyboardEvent) {
    const cep = event.target as HTMLInputElement;
    this.http.get(`${environment.apiEndereco}?cep=${cep.value}`,)
      .subscribe({
        next: (resp: any) => {
          this.form.patchValue({
            dadosPessoais: {
              endereco: {
                logradouro: resp.logradouro,
                bairro: resp.bairro,
                cidade: resp.localidade,
                estado: resp.estado
              }
            }
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

  removerFoto() {
    this.fotoPreview = null;
    this.selectedFile = null;
  }

  getFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

  cadastrar() {

    if(!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file',this.selectedFile);

    const request = this.form.value;

     formData.append('request', new Blob([JSON.stringify(request)], {type : 'application/json'}));

    this.http.post(`${environment.apiUser}/cadastros/register`, formData)
      .subscribe({
        next: (response : any) => {
            this.mensagemSucesso.set(true);
            this.mensagem200.set(response.message);
            
        },
        error: (e) => {
          this.mensagem400.set(e.error.message);
          this.mensagemErro.set(true);
        }
      })
  }

  return() {
   this.router.navigate(['/welcome']);
  }


}
