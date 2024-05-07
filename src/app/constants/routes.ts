export class Routes {
	static readonly BASE: string = '/';
	static readonly LOGIN: string = '/auth/login';
	static readonly FORGOT_PASSWORD: string = '/auth/forgot-password';
	static readonly RESET_PASSWORD: string = '/auth/reset-password';
	/** Home as Project list */
	static readonly PROJECTS: string = '/projects';
	/** Create New Project */
	static readonly PROJECT_CREATE: string = '/project/create';
	/** Manage/Edit Project */
	static readonly PROJECT_MANAGE: string = '/project/manage/';
	// static readonly PROJECT_PROFILE: string = '/projects/project-profile';
	static readonly PROJECT_MEDIA: string = '/project/media';
	static readonly PROJECT_MEDIA_TRANSCRIPT: string = '/project/media/';
	static readonly PROJECT_COMPARE: string = '/project/compare';
	static readonly PROJECT_CANVAS: string = '/project/canvas';
	static readonly PROJECT_TEMPLATE: string = '/project/template';
	static readonly PROJECT_DOCUMENTS: string = '/project/documents';

	static readonly TEAM: string = '/team';
	static readonly SHARE_CANVAS: string = '/canvas';
	static readonly TEMPLATES: string = '/templates';
	static readonly WORKFLOWS: string = '/workflows';
	static readonly WORKFLOW_DETAILS: string = '/workflows/details';
}
