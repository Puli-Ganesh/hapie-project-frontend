export class StorageKeys {
	static readonly USER_TOKEN = 'nexGen.token';
	static readonly USER_TOKEN_EXPIRES_AT = 'nexGen.tokenExpiry';
	static readonly USER_INFORMATION = 'nexGen.user';
	static readonly PROJECT_ID = 'nexGen.projectId';
	static readonly PROJECT_NAME = 'nexGen.projectName';
	static readonly PROJECT_COLOR = 'nexGen.projectColor';
	static readonly WORKSPACE_ID = 'nexGen.workspaceId';
	static readonly WORKSPACE_NAME = 'nexGen.workspaceName';
	static readonly WORKFLOW_ID = 'nexGen.workflowId';

	/** sessionStorage */
	static readonly SST = {
		PROJECT_VIEW_TYPE: 'nexGen.projectViewType',
		WORKFLOW_VIEW_TYPE: 'nexGen.workflowViewType',
		PROJECT_ID_FOR_MICROSOFT: 'nexGen.projectIdForMicrosoft',
	};
}
