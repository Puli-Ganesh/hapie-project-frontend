import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
	selector: '[appDragDropFile]'
})
export class DragDropFileDirective {

	constructor() { }

	@Output() fileDropped = new EventEmitter<any>();

	// @HostBinding('style.background-color')
	// background = 'transparent';

	@HostListener('dragover', ['$event'])
	dragOver(event: any) {
		event.preventDefault();
		event.stopPropagation();
		// this.background = 'rgba(255,255,255,0.2)';
	}

	@HostListener('dragleave', ['$event'])
	dragLeave(event: any) {
		event.preventDefault();
		event.stopPropagation();
		// this.background = 'transparent';
	}

	@HostListener('drop', ['$event'])
	drop(event: any) {
		event.preventDefault();
		event.stopPropagation();
		// this.background = 'transparent';
		const files = event.dataTransfer.files;
		if (files.length > 0) {
			this.fileDropped.emit(files);
		}
	}
}
