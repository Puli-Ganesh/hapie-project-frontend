import { Settings } from "src/interfaces/settings.interface";

const settings: Settings = {
	apiProtocol: 'https',
	apiHost: 'nexgenforce.ai',
	apiPort: 0
}

export const environment = {
	production: true,
	settings
};
