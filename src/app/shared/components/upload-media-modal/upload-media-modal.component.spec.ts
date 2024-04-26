import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMediaModalComponent } from './upload-media-modal.component';

describe('UploadMediaModalComponent', () => {
  let component: UploadMediaModalComponent;
  let fixture: ComponentFixture<UploadMediaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadMediaModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadMediaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
