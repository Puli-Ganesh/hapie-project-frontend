import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
  ) {
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
      }
    });
  }

  protected readonly permissions = Permissions;
  protected readonly appRoutes = Routes;

  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;

  protected chats: Array<any> = [];
  protected aiLoader: boolean = false;
  @ViewChild('userInput') userInputRef!: ElementRef<HTMLInputElement>;


  ngOnInit(): void {
  }

  onGoBack() {
    this._router.navigate([this.appRoutes.PROJECTS]);
  }

  onExit() {
    this._router.navigateByUrl(this.appRoutes.PROJECTS);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        return;
      } else {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  sendMessage(): void {
    if (!this.userInputRef.nativeElement.value) {
      return;
    }
    const bodyToSend = {
      query: this.userInputRef.nativeElement.value,
      workflowId: localStorage.getItem(StorageKeys.WORKFLOW_ID) ?? ''
    };
    this.chats.push({
      'user': bodyToSend.query
    });

    this.aiLoader = true;
    setTimeout(() => {
      const element = document.getElementById('ai-loader');
      if (element) {
        element.scrollIntoView();
      }
    }, 100);

    this._facadeService.confluenceService.chat(bodyToSend).subscribe({
      next: (res: any) => {
        console.log(res)
        if (res.code == 'OK') {
          if (!res.data.response) {
            this.chats.push({
              'ai': 'There are no data for ai system.'
            });
          } else {
            this.chats.push({
              'ai': res.data.response
            });
          }
          this.aiLoader = false;
        }
      },
      error: (err: any) => {
        this.aiLoader = false;
        this.chats.push({
          'ai': 'There are no data for ai system.'
        });
        console.log('Error while chatting with chatbot', err.error);
      }
    });
    this.userInputRef.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }
}
