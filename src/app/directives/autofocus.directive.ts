import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private _hostEleRef: ElementRef) { }

  ngAfterViewInit(): void {
    this._hostEleRef.nativeElement?.focus();
  }

}
