export class StorageKeys {
	static readonly USER_TOKEN = 'hapie.token';
	static readonly USER_TOKEN_EXPIRES_AT = 'hapie.tokenExpiry';
	static readonly USER_INFORMATION = 'hapie.user';
	static readonly PROJECT_ID = 'hapie.projectId';
	static readonly PROJECT_NAME = 'hapie.projectName';
	static readonly PROJECT_COLOR = 'hapie.projectColor';
	static readonly WORKSPACE_ID = 'hapie.workspaceId';
	static readonly WORKSPACE_NAME = 'hapie.workspaceName';
	static readonly WORKFLOW_ID = 'hapie.workflowId';

	/** sessionStorage */
	static readonly SST = {
		PROJECT_VIEW_TYPE: 'hapie.projectViewType',
		WORKFLOW_VIEW_TYPE: 'hapie.workflowViewType',
		PROJECT_ID_FOR_MICROSOFT: 'hapie.projectIdForMicrosoft',
	};
}
