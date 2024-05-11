import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss']
})
export class DropDownComponent implements OnInit {

  constructor(
    protected _renderer2: Renderer2
  ) { }

  @Input('optionsList') optionsList: Array<any> = [];
  @Input('selectedOption') selectedOption!: any;
  @Input('uniqueKey') uniqueKey: string = '_id';
  @Input('displayKey') displayKey: string = '';
  @Input('isWithSearch') withSearch: boolean = false;
  @Input('maxHeight') maxHeight: number = 256;
  @Input('minWidth') minWidth: number | undefined = undefined;
  @Input('maxWidth') maxWidth: number | undefined = undefined;
  @Input('isWithOverflowVisible') withOverflowVisible: boolean = false;
  @Output() onSelectChange: EventEmitter<any> = new EventEmitter<any>();


  protected isExpanded: boolean = false;
  protected filteredList: Array<any> = [];
  protected searchKeyword: string = '';

  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;


  ngOnInit(): void {
    this.filteredList = [...this.optionsList];
    if (!this.selectedOption && this.filteredList.length) {
      this.selectedOption = this.filteredList[0];
      this.onSelectChange.emit(this.selectedOption);
    }

    setTimeout(() => {
      if (this.dropdownWrapper.nativeElement) {
        if (this.minWidth !== undefined) {
          this._renderer2.setStyle(this.dropdownWrapper.nativeElement, 'min-width', `${this.minWidth}px`);
        }
        if (this.maxWidth !== undefined) {
          this._renderer2.setStyle(this.dropdownWrapper.nativeElement, 'max-width', `${this.maxWidth}px`);
        }
      }
    }, 10);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredList = [...this.optionsList];
  }

  @HostListener('document:click', ['$event.target'])
  clickOut(target: HTMLElement) {
    if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(target)) {
      this.isExpanded = false;
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.withOverflowVisible && this.isExpanded) {
      this.updateDropdownPosition();
    }
  }

  updateDropdownPosition() {
    const selectedOptionWrap: HTMLElement = this.dropdownWrapper.nativeElement.querySelector('.selected-option-wrap');
    const optionsContainer = this.dropdownWrapper.nativeElement.querySelector('.options-container');
    if (optionsContainer && selectedOptionWrap) {
      this._renderer2.setStyle(optionsContainer, 'position', 'fixed');
      this._renderer2.setStyle(optionsContainer, 'width', `${this.dropdownWrapper.nativeElement.getBoundingClientRect()?.width}px`);
      this._renderer2.setStyle(optionsContainer, 'top', `${selectedOptionWrap.getBoundingClientRect().bottom}px`);
      this._renderer2.setStyle(optionsContainer, 'left', `${this.dropdownWrapper.nativeElement.getBoundingClientRect()?.left}px`);
    }

    const optionsWrap = this.dropdownWrapper?.nativeElement?.querySelector('.options-wrap');
    if (optionsWrap) {
      this._renderer2.setStyle(optionsWrap, 'max-height', `${this.maxHeight}px`);
    }
  }


  onToggleDropDown() {
    this.isExpanded = !this.isExpanded;
    if (this.withOverflowVisible) {
      setTimeout(() => {
        this.updateDropdownPosition();
      }, 0);
    }
  }

  protected onSearchDebounceTimeoutIt: any;
  onSearch() {
    if (this.onSearchDebounceTimeoutIt) clearTimeout(this.onSearchDebounceTimeoutIt);

    this.onSearchDebounceTimeoutIt = setTimeout(() => {
      if (this.displayKey) {
        this.filteredList = this.optionsList.filter((option: any) => option[this.displayKey].toLowerCase().includes(this.searchKeyword.toLowerCase()));
      } else {
        this.filteredList = this.optionsList.filter((option: any) => option.toLowerCase().includes(this.searchKeyword.toLowerCase()));
      }
    }, 300);
  }

  onSelectOption(optionIndex: number) {
    if (this.selectedOption === this.filteredList[optionIndex]) {
      this.isExpanded = false;
      return;
    }

    this.selectedOption = this.filteredList[optionIndex];
    this.filteredList = [...this.optionsList];
    this.searchKeyword = '';
    this.onSelectChange.emit(this.selectedOption);
    this.isExpanded = false;
  }

}
