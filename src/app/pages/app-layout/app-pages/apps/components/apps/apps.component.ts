import { Component, OnInit } from '@angular/core';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit {

  constructor(
    protected _facadeService: FacadeService
  ) { }

  protected appList: Array<any> = [];

  protected readonly appsAssets: any = {
    "Start": 'start.svg',
    "Teams": 'teams.svg',
    "Zoom": 'zoom.svg',
    "Meet": 'meet.svg',
    "Video Upload": 'video-upload.svg',
    "Analysis": 'analysis.svg',
    "AI": 'ai.svg',
    "Compare Video": 'compare-video.svg',
    "Canvas": 'canvas.svg',
    "Document": 'document.svg',
    "Pandadoc": 'pandadoc.svg',
    "Email": 'email.svg',
    "Slack": 'slack.svg',
    "Audio App": 'audio-app.svg',
    "Chat Bot": 'chat-bot.svg',
    "Document Upload": 'document-upload.svg',
    "Image": 'image.svg',
    "Hangouts": 'hangouts.svg',
    "Google Chat": 'google-chat.svg',
    "Machine Learning": 'machine-learning.svg',
    "Salesforce": 'salesforce.svg',
    "Video App": 'video-app.svg',
    "Jenkins": 'jenkins.svg',
    "Adobe Marketing Cloud": 'adobe-marketing-cloud.svg',
    "Asana": 'asana.svg',
    "AWS": 'aws.svg',
    "Azure Devops": 'azure-devops.svg',
    "BambooHR": 'bamboo-hr.svg',
    "Bitbucket": 'bitbucket.svg',
    "Bitbucket Agent": 'bitbucket-agent.svg',
    "CircleCI": 'circleci.svg',
    "Code Climate": 'code-climate.svg',
    "Confluence": 'confluence.svg',
    "Confluence Agent": 'confluence-agent.svg',
    "Crowdstrike": 'crowdstrike.svg',
    "GitHub": 'github.svg',
    "GitLab": 'gitlab.svg',
    "Google Analytics": 'google-analytics.svg',
    "Google Cloud Platform": 'google-cloud-platform.svg',
    "Google Workspace": 'google-workspace.svg',
    "HubSpot CRM": 'hubspot-crm.svg',
    "Jira": 'jira.svg',
    "Jira Agent": 'jira-agent.svg',
    "Mailchimp": 'mailchimp.svg',
    "Marketo": 'marketo.svg',
    "Microsoft 365": 'microsoft-365.svg',
    "Microsoft Azure": 'microsoft-azure.svg',
    "Microsoft Dynamic 365": 'microsoft-dynamic-365.svg',
    "Microsoft Dynamic AX": 'microsoft-dynamic-ax.svg',
    "Microsoft": 'microsoft.svg',
    "Monday": 'monday.svg',
    "OKTA": 'okta.svg',
    "Oracle ERP Cloud": 'oracle-erp-cloud.svg',
    "Palo Alto Network": 'palo-alto-network.svg',
    "Power BI": 'power-bi.svg',
    "Sap S/4HANA": 'sap-s-4hana.svg',
    "Sap SuccessFactors": 'sap-success-factors.svg',
    "SonarQube": 'sonarqube.svg',
    "Tableau": 'tableau.svg',
    "Trello": 'trello.svg',
    "Workday": 'workday.svg',
    "Super Agent (AI)": 'super-agent-ai.png',
    "Vector Database": 'vector-database.png',
  };

  ngOnInit(): void {
    this.getRootObject();
  }

  getRootObject() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.workflowService.getRootObject().subscribe({
        next: (res: any) => {
          if (res.code == 'OK') {
            this.appList = res.data;
            if (this.appList?.length) {
              for (const app of this.appList) {
                if (this.appsAssets[app.title]) {
                  app.src = this.appsAssets[app.title];
                }
              }
            }
          }
          resolve();
        },
        error: (err: any) => {
          console.log('There is an error while getting root object', err);
          reject();
        }
      })
    });
  }

}
