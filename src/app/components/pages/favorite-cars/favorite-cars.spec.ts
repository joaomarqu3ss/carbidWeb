import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteCars } from './favorite-cars';

describe('FavoriteCars', () => {
  let component: FavoriteCars;
  let fixture: ComponentFixture<FavoriteCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteCars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteCars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
