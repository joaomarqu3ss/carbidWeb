import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarCarro } from './cadastrar-carro';

describe('CadastrarCarro', () => {
  let component: CadastrarCarro;
  let fixture: ComponentFixture<CadastrarCarro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarCarro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastrarCarro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
