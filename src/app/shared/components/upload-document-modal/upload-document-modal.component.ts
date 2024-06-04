import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';
import { HttpClientService } from '@src/app/services/http-client/http-client.service';
import { IResponse } from '@src/interfaces/response.interface';

@Component({
  selector: 'app-upload-document-modal',
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.scss']
})
export class UploadDocumentModalComponent implements OnInit, OnDestroy {

  @Input() nodeId: number | null = null;
  @Input() projectId: string = '';
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() documentUpdated: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    private _formBuilder: FormBuilder,
    private _facadeService: FacadeService,
    private _httpClientService: HttpClientService,
    private _httpClient: HttpClient
  ) {
    this.documentForm = this._formBuilder.group({
      title: ['', [
        Validators.required
      ]],
      dataType: ['', [
        Validators.required
      ]]
    })
  }

  documentForm: FormGroup;
  get title() {
    return this.documentForm.get('title');
  }
  get dataType() {
    return this.documentForm.get('dataType');
  }

  documentFile: any;
  documentUploadProgress = 0;
  documentUploadIntervalId: any;
  requestAlive = false;

  ngOnInit(): void {
    this._facadeService.modalService.registerModal('uploadDocumentModal')
    this._facadeService.modalService.openModal('uploadDocumentModal')
  }

  onCloseModal(event: any) {
    this.onClose.emit(true);
    this.resetData();
  }

  onCancel() {
    this.onClose.emit(true);
    this.resetData();
  }

  onFileDrop(event: any) {
    this.onUploadProjectCoverThumb({
      target: {
        files: event
      }
    });
  }

  onUploadProjectCoverThumb(event: any) {
    const docMimeTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (docMimeTypes.includes(event.target.files[0].type)) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(event.target.files[0]);
      this.documentFile = event.target.files[0];
    }
  }

  onRemoveFile(event: Event): void {
    event?.stopPropagation();
    this.documentFile = undefined;
  }

  onUploadDocument() {
    if (this.documentForm.invalid || this.requestAlive) {
      this.documentForm.markAllAsTouched();
      return;
    }
    if (this.nodeId == null) return;
    this.requestAlive = true;
    this.documentUploadProgress = 0;

    // @ts-ignore
    if (this.dataType.value == 'withData') {
      const formData = new FormData();
      formData.append('title', (this.title as FormControl).value);
      formData.append('projectId', this.projectId);
      formData.append('docFile', this.documentFile);
      formData.append('nodeId', (this.nodeId as number).toString());
      formData.append('dataType', (this.documentForm.get('dataType') as any).value);

      const url = this._httpClientService.fullRequestURL(`template/create-from-doc`);
      this.documentUploadIntervalId = setInterval(() => {
        this.documentUploadProgress += 2;
        if (this.documentUploadProgress >= 95) {
          clearInterval(this.documentUploadIntervalId);
          this.documentUploadIntervalId = null;
        }
      }, 800);
      this._httpClient.post(url, formData).subscribe({
        next: (res: any) => {
          this.documentUpdated.next(true);
          this.resetData();
          this.requestAlive = false;
          clearInterval(this.documentUploadIntervalId);
          this.documentUploadIntervalId = null;
          this.documentUploadProgress = 100;
          // this.saveTemplate(res.data.html);
          this._facadeService.appService.openToaster('File uploaded successfully.', 'success');
        },
        error: (err: any) => {
          this.requestAlive = false;
          if (this.documentUploadIntervalId) {
            clearInterval(this.documentUploadIntervalId)
            this.documentUploadIntervalId = null;
          }
          switch (err?.error?.code) {
            case 'UNPROCESSABLE_ENTITY':
              this._facadeService.appService.openToaster(err.error.message, 'danger');
              break;
            default:
              this._facadeService.appService.openToaster('Error while uploading document', 'danger');
              break;
          }
        }
      });
      // @ts-ignore
    } else if (this.dataType.value === 'withBlank') {
      
      const body: any = {
        title: this.title?.value,
        projectId: this.projectId,
        nodeId: this.nodeId
      };
      this._facadeService.templateService.createBlank(body).subscribe({
        next: (res: IResponse) => {
          this.requestAlive = false;
          if (res.code == "OK") {
            this.documentUpdated.next(true);
            this.resetData();
            this._facadeService.appService.openToaster('File uploaded successfully.', 'success');
          }
        },
        error: (err: any) => {
          this.requestAlive = false;
          switch (err?.error?.code) {
            case 'UNPROCESSABLE_ENTITY':
              this._facadeService.appService.openToaster(err.error.message, 'danger');
              break;
            default:
              this._facadeService.appService.openToaster('Error while uploading document', 'danger');
              break;
          }
        }
      });

    } else {
      const formData = new FormData();
      formData.append('title', (this.title as FormControl).value);
      formData.append('projectId', this.projectId);
      formData.append('docFile', this.documentFile);
      formData.append('nodeId', (this.nodeId as number).toString());
      formData.append('dataType', (this.documentForm.get('dataType') as any).value);

      const url = this._httpClientService.fullRequestURL(`template/create-from-doc`);
      this._httpClient.post(url, formData).subscribe({
        next: (res: any) => {
          this.documentUpdated.next(true);
          this.resetData();
          this.requestAlive = false;
          this._facadeService.appService.openToaster('File uploaded successfully.', 'success');
        },
        error: (err: any) => {
          this.requestAlive = false;
          switch (err?.error?.code) {
            case 'UNPROCESSABLE_ENTITY':
              this._facadeService.appService.openToaster(err.error.message, 'danger');
              break;
            default:
              this._facadeService.appService.openToaster('Error while uploading document', 'danger');
              break;
          }
        }
      });
    }
  }

  saveTemplate(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const deeperLiElements = doc.querySelectorAll('ol ol li');
    deeperLiElements.forEach(filterAndModifyContent);

    const mainOl: any = doc.querySelector('ol');
    if (mainOl) {
      for (let child of mainOl.childNodes) {
        let categoryName = '';
        if (child.childNodes[0]?.tagName == 'P') {
          categoryName = child.childNodes[0].innerText;
        }
        if (child.childNodes[1]?.tagName == 'OL' && categoryName) {
          const olElement = child.childNodes[1];
          for (let liEl of olElement.childNodes) {
            let changeEle = liEl;
            const lastValue = changeEle.innerText;
            while(changeEle.childNodes.length) {
              changeEle = changeEle.childNodes[0];
            }
            let title = lastValue.split(':')[0];
            if (!title.trim()) {
              title = categoryName;
            }
            title = title?.replace(/[^a-zA-Z0-9\s-]+/g, '');
            categoryName = categoryName?.replace(/[^a-zA-Z0-9\s-]+/g, '');
            changeEle.nodeValue = `${title}: {${categoryName} / ${title} - [Can you provide approx. ${title} from above conversation]}`;
          }
        }
      }
    }

    const modifiedHtmlString = doc.body.innerHTML;
    
    const body: any = {
      title: (this.title as any).value,
      html: modifiedHtmlString
    }
    if (this.projectId) {
      body.projectId = this.projectId;
    }
    if (this.documentUploadIntervalId) {
      clearInterval(this.documentUploadIntervalId)
      this.documentUploadIntervalId = null;
    }
    this.documentUploadIntervalId = setInterval(() => {
      this.documentUploadProgress += 2;
      if (this.documentUploadProgress >= 95) {
        clearInterval(this.documentUploadIntervalId);
        this.documentUploadIntervalId = null;
      }
    }, 200);
    this._facadeService.templateService.saveModifiedTemplate(body).subscribe({
      next: (res: any) => {
        this.requestAlive = false;
        this.documentUploadProgress = 100;
        setTimeout(() => {
          this.documentUpdated.next(true);
        }, 100);
      },
      error: (err: any) => {
        if (this.documentUploadIntervalId) {
          clearInterval(this.documentUploadIntervalId);
          this.documentUploadIntervalId = null;
        }
        this.requestAlive = false;
        this._facadeService.appService.openToaster('Error while uploading document', 'danger');
      }
    });


    function shouldKeepLi(element: any) {
      if (element.textContent.trim().length === 0) {
        return 0;
      }
      if (element.querySelector('ol, ul')) {
        return 2;
      }
      return 1;
    }

    function filterAndModifyContent(element: any) {
      let removeStatus = shouldKeepLi(element);
      if (removeStatus == 0) {
        // Remove the element if it should not be kept
        element.parentNode.removeChild(element);
      } else if (removeStatus == 2) {
        element.removeChild(element.lastChild)
      }
    }

  }

  resetData() {
    this.documentFile = null;
    this.documentForm.reset();
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('uploadDocumentModal')
  }

}
