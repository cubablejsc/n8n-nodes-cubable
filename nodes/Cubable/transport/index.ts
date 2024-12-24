import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
} from 'n8n-workflow';

import {
	CUBABLE_TOKEN_API_CREDENTIAL_NAME as CBB_CREDENTIAL_NAME,
	CubableTokenApiCredentialProps as CBBCredentialProps,
} from '../../../credentials/CubableTokenApi.credentials';

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	query?: IDataObject,
	body?: IDataObject,
	options?: IHttpRequestOptions
): Promise<any> {
	const credentials: CBBCredentialProps
		= await this.getCredentials( CBB_CREDENTIAL_NAME ) as CBBCredentialProps;
	const authenticationMethod: string
		= this.getNodeParameter( 'authentication', 0 ) as string;

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
