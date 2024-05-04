import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FacadeService } from '@src/app/services/facade.service';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { IResponse } from '@src/interfaces/response.interface';
import { Permissions } from '@src/app/constants/permissions';


@Component({
  selector: 'app-media-transcript',
  templateUrl: './media-transcript.component.html',
  styleUrls: ['./media-transcript.component.scss']
})
export class MediaTranscriptComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
    private _activatedRoute: ActivatedRoute
  ) {

    this.recordingId = this._activatedRoute.snapshot.params['id'];
    // this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;
  }

  permissions = Permissions;
  currentUser: any;

  protected readonly appRoutes = Routes;
  protected isRequestAlive: boolean = false;

  // protected projectId: string = '';
  protected projectName: string = '';

  protected recordingId: string = '';
  protected recordingDetails: any;
  protected mediaUrl: string = '';

  protected speakerWiseTranscript: any = [];
  protected speakerTags: any = {};
  protected highlightedSpeakerIndex = 0;
  protected highlightedWordIndex = 0;

  protected startSpeakerIndex: number = -1;
  protected endSpeakerIndex: number = -1;
  protected startWordIndex: number = -1;
  protected endWordIndex: number = -1;

  protected selectedText: string = '';
  protected isSelecting: boolean = false;

  protected autoHighlightUsingAi: boolean = false;

  projectColor: any;


  ngOnInit(): void {
    this.currentUser = this._facadeService.authService.getCurrentUser();
    if (!this.recordingId) {
      this._router.navigateByUrl(this.appRoutes.PROJECT_MEDIA);
      return;
    } else {
      this.getRecordingDetails();
    }
    this._facadeService.modalService.registerModal('deleteMediaModal');
  }

  getRecordingDetails() {
    if (!this.recordingId) return;

    this.isRequestAlive = true;
    this._facadeService.recordingService.findById(this.recordingId).subscribe({
      next: (res: IResponse) => {
        if (res.code === 'OK') {
          this.recordingDetails = res.data;
          this.mediaUrl = res.data.videoUrl;
          this.setSpeakerWiseTranscript(res.data.w2wTranscript);
          this.isRequestAlive = false;
        }
      },
      error: (error: any) => {
        this.isRequestAlive = false;
        console.error('There is an error while getting interview data', error);
      }
    });
  }

  setSpeakerWiseTranscript(rawTranscript: any[]) {
    this.speakerWiseTranscript = [];
    for (let z = 0; z < rawTranscript.length; z++) {
      let highlighted = false;
      if (this.recordingDetails.highlights.length) {
        for (let i = 0; i < this.recordingDetails.highlights.length; i++) {
          if (z >= this.recordingDetails.highlights[i][0] && z <= this.recordingDetails.highlights[i][1]) {
            highlighted = true;
            break;
          }
        }
      }

      if (rawTranscript[z + 1] && rawTranscript[z + 1].speaker === rawTranscript[z].speaker) {
        if (this.speakerWiseTranscript[this.speakerWiseTranscript.length - 1]) {
          this.speakerWiseTranscript[this.speakerWiseTranscript.length - 1].words.push({
            start: rawTranscript[z].start,
            end: rawTranscript[z].end,
            word: rawTranscript[z].word.trim(),
            highlighted: highlighted
          });
        } else {
          this.speakerWiseTranscript[this.speakerWiseTranscript.length] = {
            speaker: rawTranscript[z].speaker,
            words: [{
              start: rawTranscript[z].start,
              end: rawTranscript[z].end,
              word: rawTranscript[z].word.trim(),
              highlighted: highlighted
            }]
          }
        }
      } else {
        if (!this.speakerTags[rawTranscript[z].speaker]) {
          this.speakerTags[rawTranscript[z].speaker] = { tag: rawTranscript[z].speaker, title: `Speaker ${parseInt(rawTranscript[z].speaker) + 1}` }
        }

        if (this.speakerWiseTranscript[this.speakerWiseTranscript.length - 1] && this.speakerWiseTranscript[this.speakerWiseTranscript.length - 1].speaker !== rawTranscript[z].speaker) {
          this.speakerWiseTranscript[this.speakerWiseTranscript.length] = {
            speaker: rawTranscript[z].speaker,
            words: [{
              start: rawTranscript[z].start,
              end: rawTranscript[z].end,
              word: rawTranscript[z].word.trim(),
              highlighted: highlighted
            }]
          }
        } else {
          if (!this.speakerWiseTranscript.length) {
            this.speakerWiseTranscript.push({
              speaker: rawTranscript[z].speaker,
              words: []
            });
          }
          this.speakerWiseTranscript[this.speakerWiseTranscript.length - 1].words.push({
            start: rawTranscript[z].start,
            end: rawTranscript[z].end,
            word: rawTranscript[z].word.trim(),
            highlighted: highlighted
          });
        }
      }
    }
  }

  onDeleteMedia() {
    this._facadeService.modalService.openModal('deleteMediaModal');
  }

  getSegmentTime(speakerIndex: number, wordIndex: number): string {
    // @ts-ignore
    return `${parseInt(this.speakerWiseTranscript[speakerIndex].words[wordIndex].start / 60)}:${parseInt(this.speakerWiseTranscript[speakerIndex].words[wordIndex].start % 60)}`;
  }

  onGoToProjects() {
    this._router.navigate([this.appRoutes.PROJECTS])
  }

  // onGoToProject() {
  //   this._router.navigate([this.appRoutes.PROJECT_PROFILE])
  // }

  navigateOnMedia() {
    this._router.navigateByUrl(this.appRoutes.PROJECT_MEDIA);
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('deleteMediaModal')
  }

}
