import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-sign-document',
  templateUrl: './sign-document.component.html',
  styleUrls: ['./sign-document.component.scss']
})
export class SignDocumentComponent implements OnInit {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _facadeService: FacadeService
  ) {
    this.documentId = this._activatedRoute.snapshot.params['documentId'];
  }

  protected documentId: string = '';
  protected isDocumentLoaded: boolean = false;
  protected documentDetails: any;

  ngOnInit(): void {
    this.getDocumentDetails();
  }

  getDocumentDetails() {
    if (!this.documentId) return;

    this._facadeService.signedDocumentService.getById(this.documentId).subscribe({
      next: (res: any) => {
        this.isDocumentLoaded = true;
        this.documentDetails = res.data;
      },
      error: (err: any) => {
        console.log('There is an error while loading signed document data', err);
      }
    });
  }

}
