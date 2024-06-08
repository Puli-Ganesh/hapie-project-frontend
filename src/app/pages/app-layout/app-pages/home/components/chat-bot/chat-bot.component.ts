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
  protected hallucinationToggler: boolean = false;

  protected chats: Array<{
    type: 'user' | 'ai',
    message: string,
    hallucination: number
  }> = [];
  protected aiLoader: boolean = false;
  protected userQuery: string = '';
  @ViewChild('chatBoxContainer') chatBoxContainer!: ElementRef;


  ngOnInit(): void {
  }

  onGoBack() {
    this._router.navigateByUrl(this.appRoutes.PROJECTS);
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
    if (!this.userQuery) {
      return;
    }

    const bodyToSend = {
      query: this.userQuery,
      workflowId: localStorage.getItem(StorageKeys.WORKFLOW_ID) ?? ''
    };

    this.pushInChat('user', bodyToSend.query, 0);
    this.aiLoader = true;
    this.scrollToBottomChat();
    this.userQuery = '';

    this._facadeService.confluenceService.chat(bodyToSend).subscribe({
      next: (res: any) => {
        console.log(res)
        if (res.code == 'OK') {
          if (res.data?.response) {
            this.pushInChat('ai', res.data.response, this.extractPercentage(res.data?.hallucinatingPercentage?.response));
          } else {
            this.pushInChat('ai', 'There are no data for ai system.', 0);
          }
          this.aiLoader = false;
        }
        this.scrollToBottomChat();
      },
      error: (err: any) => {
        this.aiLoader = false;
        this.scrollToBottomChat();
        this.pushInChat('ai', 'There are no data for ai system.', 0);
        console.log('Error while chatting with chatbot', err.error);
      }
    });
  }

  extractPercentage(inputString: string) {
    const match = inputString?.match(/(\d+)%/);
    return (match?.length) ? parseInt(match[1]) : 0;
  }

  pushInChat(type: 'user' | 'ai', message: string, hallucination: number): void {
    this.chats.push({
      type: type,
      message: message,
      hallucination: hallucination
    });
  }

  scrollToBottomChat(): void {
    setTimeout(() => {
      this.chatBoxContainer.nativeElement.scroll({ top: this.chatBoxContainer.nativeElement.scrollHeight, behavior: 'smooth' });
    }, 0);
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }
}
