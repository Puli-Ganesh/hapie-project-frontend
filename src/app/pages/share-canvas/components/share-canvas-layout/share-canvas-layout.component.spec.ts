import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCanvasLayoutComponent } from './share-canvas-layout.component';

describe('ShareCanvasLayoutComponent', () => {
  let component: ShareCanvasLayoutComponent;
  let fixture: ComponentFixture<ShareCanvasLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareCanvasLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareCanvasLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
