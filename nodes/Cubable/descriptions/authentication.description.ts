import type {
	INodeCredentialDescription,
	INodeProperties,
} from 'n8n-workflow';

import {
	CUBABLE_CREDENTIAL_NAME,
} from '../../../credentials/CubableTokenApi.credentials';

export const credential: INodeCredentialDescription = {
	name: CUBABLE_CREDENTIAL_NAME,
	required: true,
	displayOptions: {
		show: {
			authentication: [ CUBABLE_CREDENTIAL_NAME ],
		},
	},
};

export const authentication: INodeProperties = {
	displayName: 'Authentication',
	name: 'authentication',
	type: 'options',
	options: [
		{
			name: 'Access Token',
			value: CUBABLE_CREDENTIAL_NAME,
		},
	],
	// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
	default: CUBABLE_CREDENTIAL_NAME,
};
