import type {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const CUBABLE_API_ENDPOINT: string = 'https://open.cubable.com/api/v1';
export const CUBABLE_CREDENTIAL_NAME: string = 'cubableTokenApi';

export type CubableCredentialProps = { apiKey: string; apiUrl: string; };

export class CubableTokenApi implements ICredentialType {

	name = CUBABLE_CREDENTIAL_NAME;

	displayName = 'Cubable Access Token API';

	documentationUrl = 'https://open.cubable.com/api/v1';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			placeholder: 'Enter your API Key',
			description: 'The API Key for authenticating requests.',
			required: true,
			typeOptions: { password: true },
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: `${CUBABLE_API_ENDPOINT}`,
			placeholder: 'Enter API base URL',
			description: 'The base URL for API requests.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

}
