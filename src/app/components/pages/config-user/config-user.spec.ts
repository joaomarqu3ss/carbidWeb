import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigUser } from './config-user';

describe('ConfigUser', () => {
  let component: ConfigUser;
  let fixture: ComponentFixture<ConfigUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
