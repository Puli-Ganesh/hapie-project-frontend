import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGoBackBtnComponent } from './project-go-back-btn.component';

describe('ProjectGoBackBtnComponent', () => {
  let component: ProjectGoBackBtnComponent;
  let fixture: ComponentFixture<ProjectGoBackBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectGoBackBtnComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectGoBackBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
