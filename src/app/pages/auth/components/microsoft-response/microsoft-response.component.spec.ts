import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftResponseComponent } from './microsoft-response.component';

describe('MicrosoftResponseComponent', () => {
  let component: MicrosoftResponseComponent;
  let fixture: ComponentFixture<MicrosoftResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicrosoftResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
