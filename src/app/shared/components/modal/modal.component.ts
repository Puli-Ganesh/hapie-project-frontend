import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  @Input() id: string = '';
  @Input() type: string = 'default';
  @Input('isFullScreen') isFullScreen: boolean = false;
  @Output('onClose') onCloseEvent: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('modalContainer') modalContainer!: ElementRef;

  constructor(
    public _facadeService: FacadeService
  ) { }

  backdropClick(event: any) {
    // event.stopPropagation();

    if (this.modalContainer && this.modalContainer.nativeElement.contains(event.target)) {
      return;
    }

    if (this.type === 'static') return;

    this.close();
  }

  close() {
    this.onCloseEvent.emit(true);
    this._facadeService.modalService.closeModal(this.id);
  }

}
