import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Document, HeadingLevel, Paragraph, Packer } from 'docx';
import { saveAs } from 'file-saver';

import { FacadeService } from '@src/app/services/facade.service';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { IResponse } from '@src/interfaces/response.interface';
import { Permissions } from '@src/app/constants/permissions';
import { Location } from '@angular/common';
import { Roles } from '@src/app/constants/roles';


@Component({
  selector: 'app-media-transcript',
  templateUrl: './media-transcript.component.html',
  styleUrls: ['./media-transcript.component.scss']
})
export class MediaTranscriptComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
    private _activatedRoute: ActivatedRoute,
    private _location: Location,
  ) {

    this.recordingId = this._activatedRoute.snapshot.params['id'];

    // this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    // this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    // this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;

        const nodes = this.projectDetails?.workflowId?.nodes;
        if (nodes?.length) {
          this.hasAnalysisAccess = nodes.some((n: any) => n.app === 'Analysis');
        } else {
          this.hasAnalysisAccess = false;
        }
      }
    });
  }

  permissions = Permissions;
  currentUser: any;

  protected readonly appRoutes = Routes;
  protected readonly userRoles = Roles;
  protected isRequestAlive: boolean = false;

  // protected projectId: string = '';
  // protected projectName: string = '';
  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;
  protected hasAnalysisAccess: boolean = false;


  protected recordingId: string = '';
  protected recordingDetails: any;
  protected mediaUrl: string = '';
  protected mediaControlsList: string = 'download playbackrate fullscreen';

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
    const isViewer = this.userRoles.VIEWER == this.currentUser.type;
    if (isViewer) {
      this.mediaControlsList = this.mediaControlsList.replace('download', `no$&`).trim();
    }
    if (!this.hasAnalysisAccess) {
      this._location.back();
      return;
    }
    if (!this.recordingId) {
      this.navigateOnMedia();
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
        this.isRequestAlive = false;
        if (res.code === 'OK') {
          this.recordingDetails = res.data;
          this.mediaUrl = res.data.videoUrl;
          this.setSpeakerWiseTranscript(res.data.w2wTranscript);
        }
      },
      error: (error: any) => {
        this.isRequestAlive = false;
        if (error.error.code === 'E_NOT_FOUND') {
          this._facadeService.appService.openToaster('Media not found.', 'danger');
          this.navigateOnMedia();
        }
        console.error('Error while getting media transcript', error.error);
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

  onConfirmDeleteMedia() {
    if (!this.recordingDetails?._id) {
      this._facadeService.modalService.closeModal('deleteMediaModal');
      return;
    }

    this._facadeService.recordingService.deleteById(this.recordingDetails._id).subscribe({
      next: (res: IResponse) => {
        if (res.code === "OK") {
          this._facadeService.modalService.closeModal('deleteMediaModal');
          this.navigateOnMedia();
        }
      },
      error: (err: any) => {
        console.error('Error while deleting media', err.error);
      }
    });
  }

  onCancelDeleteMedia() {
    this._facadeService.modalService.closeModal('deleteMediaModal');
  }

  getSegmentTime(speakerIndex: number, wordIndex: number): string {
    // @ts-ignore
    return `${parseInt(this.speakerWiseTranscript[speakerIndex].words[wordIndex].start / 60)}:${parseInt(this.speakerWiseTranscript[speakerIndex].words[wordIndex].start % 60)}`;
  }

  onDownloadTranscript(): void {
    try {
      const transcripts: Array<any> = [];
      this.speakerWiseTranscript.forEach((item: any, idx: number) => {
        const name = this.speakerTags[item.speaker].title;
        // const time = this.getSegmentTime(idx, 0);

        transcripts.push(new Paragraph({
          text: name,// `${name} ${time}`
          heading: HeadingLevel.HEADING_2
        }));
        const dataString = item.words.map((word: any) => word.word).join(' ');
        transcripts.push(new Paragraph({
          text: dataString,
          style: "Paragraph1",
        }));
        transcripts.push(new Paragraph(''));
      });

      const docx = new Document({
        creator: "NexGen Force",
        title: "NexGen Force Report",
        description: "NexGen Force Report",
        styles: {
          paragraphStyles: [
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Arial",
                size: 32,
                bold: true,
                color: "000000",
              },
              paragraph: {
                spacing: {
                  after: 180,
                  before: 180,
                },
              },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Arial",
                size: 22,
                bold: true,
                color: "000000",
              },
              paragraph: {
                spacing: {
                  after: 120,
                  before: 120,
                },
              },
            },
            {
              id: "Paragraph1",
              name: "Paragraph 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Arial",
                size: 22,
                color: "000000",
              },
              paragraph: {
                spacing: {
                  after: 20,
                  before: 20,
                },
              },
            }
          ],
        },
        sections: [{
          children: [...transcripts],
        }],
      });

      Packer.toBlob(docx).then(blob => {
        const fileName = `Transcript ${this.projectDetails?.projectName ?? ''} media upload ${this.recordingDetails?.version}.docx`.replace(/\s+/g, ' ');
        saveAs(blob, fileName);
      }).catch(err => {
        console.log("Error while save transcript", err);
      });
    } catch (error) {
      console.log('Error while downloading transcript', error);
    }
  }

  // onGoToProject() {
  //   this._router.navigate([this.appRoutes.PROJECT_PROFILE])
  // }

  navigateOnMedia() {
    this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(this.appRoutes.PROJECT_MEDIA));
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('deleteMediaModal');
    this.projectDetailsSubscription?.unsubscribe();
  }

}
