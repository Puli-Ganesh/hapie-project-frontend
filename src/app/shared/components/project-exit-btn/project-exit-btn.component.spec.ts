import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExitBtnComponent } from './project-exit-btn.component';

describe('ProjectExitBtnComponent', () => {
  let component: ProjectExitBtnComponent;
  let fixture: ComponentFixture<ProjectExitBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectExitBtnComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectExitBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
