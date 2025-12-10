import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
opcionaisArr: string[] = [];


form = this.fb.group({
    nome: new FormControl('',[Validators.required]),
    marca: new FormControl('',[Validators.required]),
    modelo: new FormControl('',[Validators.required]),
    ano: new FormControl('',[Validators.required]),
    cor: new FormControl('',[Validators.required]),
    tipo: new FormControl('',[Validators.required]),
    direcao: new FormControl('',[Validators.required]),
    transmissao: new FormControl('',[Validators.required]),
    motor: new FormControl('',[Validators.required]),
    portas: new FormControl('',[Validators.required]),
    quilometragem: new FormControl('',[Validators.required]),
    placa: new FormControl('',[Validators.required]),
    combustivel: new FormControl('',[Validators.required]),
    opcionais: new FormControl('', [Validators.required]),
    descricao: new FormControl('',[Validators.required]),
    preco: new FormControl('',[Validators.required]),
    tipoDeVenda: new FormControl('',[Validators.required])
})
  
  // Toast
  toastVisible: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';

  constructor(private router: Router,
    private http: HttpClient
  ) {}

  check(event : any) {
  const opcionaisInput = event.target.checked;
  const value = event.target.value
  if(opcionaisInput === true) {
    this.opcionaisArr.push(value)
  }
  if(opcionaisInput === false) {
    for(var i = 0; i < this.opcionaisArr.length; i++) {
      const found = (opc: any) => opc == value;
      const index = this.opcionaisArr.findIndex(found);

      this.opcionaisArr.splice(index,1);
      break;
    } 
  }
}

  resetInput(event: any) {
  event.target.value = null; // Permite selecionar o mesmo arquivo novamente
}

  onFileSelected(event : any) {

     const selectedFiles = event.target.files;

    this.files = [];
    this.fotos = []; // limpa a lista de previews

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      this.files.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotos.push(e.target.result); // adiciona preview base64
      };
      reader.readAsDataURL(file);
    }

  }

  handleRemoveFoto(index: number) {
    this.fotos.splice(index, 1);
    this.files.splice(index, 1);
  }

  onSumbit() {
    
    const auth = sessionStorage.getItem('token');
    const user = JSON.parse(auth as string);

    const formData = new FormData();

    this.form.value.opcionais = this.opcionaisArr.toString();

    for(const file of this.files) {
      formData.append('files',file);
    }
    formData.append('request', new Blob([JSON.stringify(this.form.value)], {type: 'application/json'}));

    this.http.post(`${environment.apiCarbid}/carro/cadastrar`, formData, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        console.log(resp);
        this.router.navigate(['/meus-carros']);
      },
      error: (e) => {
        console.log(e.error.message);
      }
    })


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
