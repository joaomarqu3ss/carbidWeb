import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-editar-carro',
  imports: [Sidebar, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './editar-carro.html',
  styleUrl: './editar-carro.css'
})
export class EditarCarro {

  router = inject(Router);
  fotos: string[] = [];
  files: File[] = [];
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  opcionaisArr: string[] = [];
  toastVisible = signal<boolean>(false);
  toastTitle: string = '';
  toastMessage: string = '';

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

ngOnInit() {
    const auth = sessionStorage.getItem('token')
    const user = JSON.parse(auth as string)

    const idParam = this.route.snapshot.params['id']
  
    this.http.get(`${environment.apiCarbid}/carro/disponiveis/${idParam}`, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.form.patchValue({
          nome: resp.nome,
          marca: resp.marca,
          modelo: resp.modelo,
          ano: resp.ano,
          cor: resp.cor,
          tipo: resp.tipo,
          direcao: resp.direcao,
          transmissao: resp.transmissao,
          motor: resp.motor,
          portas: resp.portas,
          quilometragem: resp.quilometragem,
          placa: resp.finalDePlaca,
          combustivel: resp.combustivel,
          descricao: resp.descricao,
          preco: resp.preco,
          tipoDeVenda: resp.rentorsell
        });

        const listOpc = resp.opcionais
        this.findCheckBox(listOpc)
      },
      error: (e) => {
        console.log(e.error.message)
      }
    })
  }

  findCheckBox(list : any) {

     for(let i = 0; i < list.length; i++) {
          const word = list[i];
          const formatter = this.replaceSpaces(word)
          const wordLower = formatter.toLowerCase()
          const replaced = this.replaceLetters(wordLower);
          const replaced2 = this.replaceLetters(replaced);
          const checkBoxed = document.getElementById(replaced2);
          checkBoxed?.click()
        }
  }

  replaceSpaces(palavra : string) {
    return palavra.replaceAll(' ', '');
  }

  replaceLetters(palavra : string) {

      const map = this.mapLetters();
      const listChars = ['ã','á','â','é','í','ç']
      
      for(let i = 0; i < palavra.length; i++) {

        if(listChars.includes(palavra.charAt(i))) {
          var replace = map.get(palavra.charAt(i));
          
          return palavra.replace(palavra.charAt(i), replace);
        } 
      }
      return palavra;
  }

  mapLetters() {
    const map = new Map()
    map.set('â','a');
    map.set('ã','a');
    map.set('á','a');
    map.set('é','e');
    map.set('í','i');
    map.set('ç','c');
    return map;
  }

  onSubmit() {

    const auth = sessionStorage.getItem('token')
    const user = JSON.parse(auth as string)
    
    const idParam = this.route.snapshot.params['id']

    const formData = new FormData();
    for(const file of this.files) {
      formData.append('files',file);
    }

    const opc = this.opcionaisArr.toString()
    this.form.value.opcionais = opc

    formData.append('request', new Blob([JSON.stringify(this.form.value)], {type: 'application/json'}));

    this.http.put(`${environment.apiCarbid}/carro/atualizar/${idParam}`,formData, {headers: {Authorization: `Bearer ${user.token}`}})
    .subscribe({
      next: (resp : any) => {
        this.showToast('Carro atualizado!', resp.message);
      
      },
      error: (e) => {
        console.log(e.error.message)
      }
    })
  }

 handleRemoveFoto(index: number) {
    this.fotos.splice(index, 1);
    this.files.splice(index, 1);
  }

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

  voltar(): void {
    this.router.navigate(['/meus-carros']);
  }

  showToast(title: string, message: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVisible.set(true)
    
    setTimeout(() => {
      this.toastVisible.set(false);
    }, 3000);
  }
}
