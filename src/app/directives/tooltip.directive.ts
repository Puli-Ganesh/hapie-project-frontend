import { Directive, ElementRef, HostListener, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnChanges {

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  @Input('appTooltip') appTooltip: boolean | string = true;
  @Input('appTooltipText') appTooltipText: string = 'Default message!';
  @Input('appTooltipPlacement') placement: string = 't';
  @Input('appTooltipDelay') delay: number = 200;

  protected _placements: any = {
    t: 'top',
    l: 'left',
    b: 'bottom',
    r: 'right',
    getPlacement: () => {
      return this._placements[this.placement] || this._placements['t'];
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['appTooltip']?.currentValue === 'boolean') {
      this.appTooltip = changes['appTooltip'].currentValue;
    } else if (!this.appTooltip) {
      this.appTooltip = true;
    }
  }

  createTooltip(): HTMLElement {
    const tooltipEle = this.renderer.createElement('div');
    const tooltipText = this.renderer.createText(this.appTooltipText);
    this.renderer.appendChild(tooltipEle, tooltipText);
    this.renderer.addClass(tooltipEle, 'app-tooltip');
    this.renderer.addClass(tooltipEle, this._placements.getPlacement());
    return tooltipEle;
  }

  @HostListener('mouseenter', ['$event'])
  onMouseOver(event: any) {
    if (this.appTooltip && !this.elRef.nativeElement.querySelector('.app-tooltip')) {
      const tooltipEle = this.createTooltip();
      this.renderer.appendChild(this.elRef.nativeElement, tooltipEle);
      this.elRef.nativeElement.classList.add('app-z-index-99');
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseOut(event: any) {
    if (this.appTooltip) {
      const tooltipEle = this.elRef.nativeElement.querySelector('.app-tooltip');
      if (tooltipEle) {
        setTimeout(() => {
          tooltipEle.remove();
          this.elRef.nativeElement.classList.remove('app-z-index-99');
          // this.renderer.removeChild(this.elRef.nativeElement, tooltipEle);
        }, this.delay);
      }
    }
  }
}