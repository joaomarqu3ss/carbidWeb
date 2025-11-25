import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesDoCarro } from './detalhes-do-carro';

describe('DetalhesDoCarro', () => {
  let component: DetalhesDoCarro;
  let fixture: ComponentFixture<DetalhesDoCarro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesDoCarro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalhesDoCarro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
