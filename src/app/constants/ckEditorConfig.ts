export class CkEditorConfig {

  static get documentOutline(): { documentOutline: object } {
    return {
      documentOutline: {
        container: document.querySelector('#outline')
      }
    };
  }

  static readonly config = {
    toolbar: {
      items: [
        // 'aiCommands', 'aiAssistant', '|',
        'uploadImage', 'ckbox', '|',
        'exportPDF', 'exportWord', '|',
        // 'comment', 'trackChanges', '|',
        'findAndReplace', 'selectAll', '|', // 'formatPainter', 
        'undo', 'redo',
        'previousPage',
        'nextPage',
        'pageNavigation', '|',
        'bold', 'italic', 'strikethrough', 'underline', 'removeFormat', '|',
        'bulletedList', 'numberedList', 'todoList', '|',
        'outdent', 'indent', '|',
        'alignment', '|',
        'heading', '|',
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', // 'highlight', 
        'link', 'blockQuote', 'insertTable', '|', // 'mediaEmbed', 'codeBlock', 'htmlEmbed', 'tableOfContents', 'insertTemplate',
        'specialCharacters', 'horizontalLine', 'pageBreak', '|',
        // Intentionally skipped buttons to keep the toolbar smaller, feel free to enable them:
        // 'code', 'subscript', 'superscript', 'textPartLanguage', '|',
        // ** To use source editing remember to disable real-time collaboration plugins **
        // 'sourceEditing'
      ],
      shouldNotGroupWhenFull: true
    },
    template: {
      definitions: []
    },
    style: {
      definitions: []
    },
    fontSize: {
      options: [10, 12, 14, 16, 18, 20, 22],
      supportAllValues: true
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    on: {
      instanceReady: function (evt: any) {
        var editor = evt.editor;

        editor.filter.check('li'); // -> true (thanks to Format combo)
        editor.filter.check('ol'); // -> true (thanks to extraAllowedContent)
        // editor.setData( '<h1><i>Foo</i></h1><p class="left"><b>Bar</b> <a href="http://foo.bar">foo</a></p>' );
        // // Editor contents will be:
        // '<h1><i>Foo</i></h1><p><b>Bar</b> foo</p>'
      }
    },
    sidebar: {
      container: document.querySelector('#sidebar')
    },
    documentOutline: {
      container: document.querySelector('#outline')
    },
    pagination: {
      // A4
      pageWidth: '21cm',
      pageHeight: '29.7cm',
      // enableOnUnsupportedBrowsers: true,// default false
      pageMargins: {
        top: '20mm',
        bottom: '20mm',
        left: '12mm',
        right: '12mm'
      }
    },
    exportPdf: {
      converterOptions: {
        format: 'A4',
        margin_top: '20mm',
        margin_bottom: '20mm',
        margin_right: '12mm',
        margin_left: '12mm',
      }
    },
    exportWord: {
      converterOptions: {
        format: 'A4',
        margin_top: '20mm',
        margin_bottom: '20mm',
        margin_right: '12mm',
        margin_left: '12mm',
        // header:  [{
        //   "html": "<p>My document header</p>",
        //   "css": "p { color: gray; }",
        //   "type": "default"
        //   }]
      }
    },
    // collaboration: {
    //   // Modify the channelId to simulate editing different documents
    //   // https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration-integration.html#the-channelid-configuration-property
    //   // channelId: 'document-id-6'
    // },
    cloudServices: {
      // Be careful - do not use the development token endpoint on production systems!
      tokenUrl: 'https://107207.cke-cs.com/token/dev/EepKWFkThp2IXZcEVifOfkcdeVq57z2juDbM?limit=10',
      webSocketUrl: 'wss://107207.cke-cs.com/ws',
      uploadUrl: 'https://107207.cke-cs.com/easyimage/upload/'
    },
    licenseKey: 'c1hFUml6YXhNTnhDbjN4QVBEb24vRkdTL09tRlFZeFEyaEp1WWRWMjVmWmphL2FxTkJiMEpEc2ZURGVFLU1qQXlOREExTVRrPQ==',
    removePlugins: [
      'Base64UploadAdapter',
      // Intentionally disabled, file uploads are handled by CKBox
      'CKFinder',
      // Intentionally disabled, file uploads are handled by CKBox
      'EasyImage',
      // Requires additional license key
      'WProofreader',
      // Incompatible with real-time collaboration
      'SourceEditing',
      // Careful, with the Mathtype plugin CKEditor will not load when loading this sample
      // from a local file system (file://) - load this site via HTTP server if you enable MathType
      'MathType',
      'PresenceList',
      'RevisionHistory',
      'RealTimeCollaborativeTrackChanges',
      'RealTimeCollaborativeRevisionHistory',
      'RealTimeCollaborativeComments',
      'RealTimeCollaborativeEditing',
      'RealTimeCollaborationClient'
    ]
  };
}