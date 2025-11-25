import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeusCarros } from './meus-carros';

describe('MeusCarros', () => {
  let component: MeusCarros;
  let fixture: ComponentFixture<MeusCarros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusCarros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeusCarros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
