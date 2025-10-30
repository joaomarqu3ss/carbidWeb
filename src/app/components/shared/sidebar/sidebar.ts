import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  sidebarAberta = false;
  menuUsuarioAberto = false;
  nomeUsuario = signal('');
  emailUsuario = signal('');
  fotoUsuario = signal('');
  perfil = signal('');
  router = inject(Router);
  http = inject(HttpClient)
  gerente = false;


  ngOnInit(id : string) {
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);
    this.emailUsuario.set(user.email);
    this.nomeUsuario.set(user.nome)
    id = user.id
    
    if(user.perfil === 'Gerente'){
      this.gerente = true;
      this.perfil.set(user.perfil);
    }

    this.http.get(`${environment.apiUser}/foto-perfil/${id}`, {responseType : 'blob', headers : {Authorization: `Bearer ${user.token}` } })
    .subscribe({
      next : (resp : Blob) => {
        
        const reader = new FileReader();

        reader.onload = () => {
          this.fotoUsuario.set(reader.result as string)
        }

        reader.readAsDataURL(resp);

      },
      error: () => {
        console.log('foto não encontrada')
      }
    })
  }

  toggleSidebar() {
    this.sidebarAberta = !this.sidebarAberta;
  }

  fecharSidebar() {
    this.sidebarAberta = false;
  }

  abrirMenuUsuario() {
  this.menuUsuarioAberto = true;
}

fecharMenuUsuario() {
  this.menuUsuarioAberto = false;
}

  sair() {
    if(confirm('Deseja sair da sua conta?')){
      sessionStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  
  }

  abrirConfiguracoes() {
    this.router.navigate(['/config/profile'])
   
  }
}
