import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCarro } from './editar-carro';

describe('EditarCarro', () => {
  let component: EditarCarro;
  let fixture: ComponentFixture<EditarCarro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCarro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCarro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
