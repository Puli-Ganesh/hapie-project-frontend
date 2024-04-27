import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCanvasComponent } from './share-canvas.component';

describe('ShareCanvasComponent', () => {
  let component: ShareCanvasComponent;
  let fixture: ComponentFixture<ShareCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareCanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
