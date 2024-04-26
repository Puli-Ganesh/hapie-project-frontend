import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonOutletComponent } from './common-outlet.component';

describe('CommonOutletComponent', () => {
  let component: CommonOutletComponent;
  let fixture: ComponentFixture<CommonOutletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonOutletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
