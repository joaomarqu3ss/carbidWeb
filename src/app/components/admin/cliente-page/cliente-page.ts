import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cliente-page',
  imports: [Sidebar, CommonModule],
  templateUrl: './cliente-page.html',
  styleUrl: './cliente-page.css'
})
export class ClientePage {


  http = inject(HttpClient);
  router = inject(Router);
  acdRouted = inject(ActivatedRoute);
  fotoUsuario = signal('');
  nomeUsuario = signal('');
  email = signal('');
  dataNascimento = signal('');
  cpf = signal('');
  dataCriacao = signal('');
  telefone = signal('');
  logradouro = signal('');
  complemento = signal('');
  cep = signal('');
  numero = signal('');
  bairro = signal('');
  cidade = signal('');
  estado = signal('');
  


  ngOnInit() {

    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);

    const idParam = this.acdRouted.snapshot.params['id'];
    
    this.http.get(`${environment.apiUser}/buscar-usuario/${idParam}`)
    .subscribe({
      next: (resp : any) => {
        this.nomeUsuario.set(resp.dados.nomeCompleto);
        this.email.set(resp.email);
        this.dataNascimento.set(resp.dados.dataNascimento);
        this.cpf.set(resp.dados.cpf);
        this.dataCriacao.set(resp.dataCriacao);
        this.telefone.set(resp.dados.telefone);
        this.logradouro.set(resp.dados.endereco.logradouro);
        this.complemento.set(resp.dados.endereco.complemento);
        this.cep.set(resp.dados.endereco.cep);
        this.numero.set(resp.dados.endereco.numero);
        this.bairro.set(resp.dados.endereco.bairro);
        this.cidade.set(resp.dados.endereco.cidade);
        this.estado.set(resp.dados.endereco.estado);

      },
      error: (e) => {
        console.log(e.error.message)
      }
    })

    this.http.get(`${environment.apiUser}/foto-perfil/${idParam}`, {responseType : 'blob' })
    .subscribe({
      next: (resp : Blob) => {
          const reader = new FileReader()

          reader.onload = () => {
            this.fotoUsuario.set(reader.result as string);
          }

          reader.readAsDataURL(resp);
      },
      error: (e) => {
        console.log(e.error.message);
      }
    });
  }

  aprovar() {
    const idParam = this.acdRouted.snapshot.params['id'];

    if(confirm('Deseja aprovar este usuário')){
    this.http.patch(`${environment.apiUser}/cadastros/verify/${idParam}`,null)
    .subscribe({
      next: () => {
        this.router.navigate(['/adm-verify'])
      },
      error: (e) => {
        console.log(e.error.message);
      }
    })
  }
  }

  reprovar() {
    const idParam = this.acdRouted.snapshot.params['id'];

    if(confirm('Deseja aprovar este usuário')){
    this.http.delete(`${environment.apiUser}/delete/${idParam}`)
    .subscribe({
      next: () => {
        this.router.navigate(['/adm-verify'])
      },
      error: (e) => {
        console.log(e.error.message);
      }
    })
  }
  }

}
