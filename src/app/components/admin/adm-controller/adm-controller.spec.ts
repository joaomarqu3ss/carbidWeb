import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmController } from './adm-controller';

describe('AdmController', () => {
  let component: AdmController;
  let fixture: ComponentFixture<AdmController>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmController]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
