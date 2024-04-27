import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTranscriptComponent } from './media-transcript.component';

describe('MediaTranscriptComponent', () => {
  let component: MediaTranscriptComponent;
  let fixture: ComponentFixture<MediaTranscriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaTranscriptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaTranscriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
