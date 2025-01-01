import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

import {
	CUBABLE_CREDENTIAL_NAME,
	CubableCredentialProps,
} from '../../../credentials/CubableTokenApi.credentials';

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	query?: IDataObject,
	body?: IDataObject,
	options?: IHttpRequestOptions
): Promise<any> {
	const credentials: CubableCredentialProps =
		await this.getCredentials( CUBABLE_CREDENTIAL_NAME ) as CubableCredentialProps;
	const authenticationMethod: string =
		this.getNodeParameter( 'authentication', undefined ) as string;

	return this.helpers.requestWithAuthentication.call(
		this,
		authenticationMethod,
		{
			method,
			url: `${credentials.apiUrl}/${endpoint}`,
			headers: {
				contentType: 'application/json',
				...options?.headers,
			},
			qs: query,
			body,
			json: true,
		}
	);
}
