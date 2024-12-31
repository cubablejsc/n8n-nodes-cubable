import {
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

import {
	CUBABLE_TOKEN_API_CREDENTIAL_NAME as CBB_CREDENTIAL_NAME,
} from '../../credentials/CubableTokenApi.credentials';

import { apiRequest } from './transport';
import { baseRLC, tableRLC } from './actions/common.description';
import { listSearch } from './methods';

export class CubableTrigger implements INodeType {

	description: INodeTypeDescription = {
		displayName: 'Cubable Trigger',
		name: 'cubable-trigger',
		icon: 'file:cubable.svg',
		group: [ 'trigger' ],
		version: 1,
		description: 'Starts the workflow when Cubable events occur',
		defaults: { name: 'Cubable Trigger' },
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node, n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [ NodeConnectionType.Main ],
		credentials: [
			{
				name: CBB_CREDENTIAL_NAME,
				required: true,
				displayOptions: {
					show: {
						authentication: [ CBB_CREDENTIAL_NAME ],
					},
				},
			}
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				path: 'cubable-webhook',
				responseCode: '200',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: CBB_CREDENTIAL_NAME,
					},
				],
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
				default: CBB_CREDENTIAL_NAME,
			},
			// {
			// 	displayName: 'Resource',
			// 	name: 'resource',
			// 	type: 'options',
			// 	options: [
			// 		// { name: 'Base', value: 'base' },
			// 		// { name: 'Table', value: 'table' },
			// 		// { name: 'Field', value: 'field' },
			// 		{ name: 'Record', value: 'record' },
			// 	],
			// 	default: 'record',
			// 	noDataExpression: true,
			// 	required: true,
			// },
			baseRLC,
			tableRLC,
		],
	};

	methods = { listSearch };

	// @ts-ignore
	webhookMethods = {
		'default': {
			checkExists: async function ( this: IHookFunctions ): Promise<boolean> {
				const baseID: string = this.getNodeParameter( 'base', undefined, {
					extractValue: true,
				} ) as string;

				const response: any = await apiRequest.call( this, 'GET', 'webhooks', { baseID } );
				const data: { notificationUrl: string }[] = response.data || [];

				const webhookUrl: string = this.getNodeWebhookUrl( 'default' ) as string;

				const exists: boolean = data.some(({ notificationUrl }) => notificationUrl === webhookUrl );

				// @ts-ignore
				console.log( 'check webhook exists' );

				return exists;
			},
			create: async function ( this: IHookFunctions) : Promise<boolean> {
				const baseID: string = this.getNodeParameter( 'base', undefined, {
					extractValue: true,
				} ) as string;
				const tableID: string = this.getNodeParameter( 'table', undefined, {
					extractValue: true,
				} ) as string;
				const webhookUrl: string = this.getNodeWebhookUrl( 'default' ) as string;
				const body: IDataObject = {
					notificationUrl: webhookUrl,
					params: {
						filters: {
							// "sourceTypes": [],
							eventTypes: [
								'records:create',
								'records:update',
								'records:delete',
							],
							eventOnTableIDs: [
								tableID,
							],
							// eventOnRecordInFieldIDs: [
							// 	"field1",
							// 	"field2"
							// ],
						},
					},
				};

				const response: any = await apiRequest.call( this, 'POST', 'webhooks', { baseID }, body );
				const data: { id: string; macSecretBase64: string } = response.data;

				if ( data ) {
					const nodeStaticData: IDataObject = this.getWorkflowStaticData( 'node' );

					nodeStaticData.webhookID = data.id;
					nodeStaticData.webhookMacSecretBase64 = data.macSecretBase64;
				}

				// @ts-ignore
				console.log( 'create webhook' );

				return true;
			},
			delete: async function (this: IHookFunctions): Promise<boolean> {
				const nodeStaticData: IDataObject = this.getWorkflowStaticData( 'node' );
				const webhookID: string = nodeStaticData.webhookID as string;

				if ( webhookID ) {
					const baseID: string = this.getNodeParameter( 'base', undefined, {
						extractValue: true,
					} ) as string;

					await apiRequest.call( this, 'DELETE', `webhooks/${webhookID}`, { baseID } );

					delete nodeStaticData.webhookID;
					delete nodeStaticData.webhookMacSecretBase64;
				}

				// @ts-ignore
				console.log( 'delete webook' );

				return true;
			},
		},
	};

	async webhook( this: IWebhookFunctions ): Promise<IWebhookResponseData> {		
		const data: IDataObject = {};

		const req: any = this.getRequestObject();

		data.headers = req.headers;
		data.params = req.params;
		data.query = req.query;
		data.body = req.body;

		const webhookUrl: string = this.getNodeWebhookUrl( 'default' ) as string;

		data.webhookUrl = webhookUrl;

		const executionMode: string = this.getMode() === 'manual' ? 'test' : 'production';

		data.executionMode = executionMode;

		const baseID: string = req.body.baseID;
		const webhookID: string = req.body.webhookID;
		const cursor: string = req.body.cursor;
		const qs: IDataObject = { baseID, cursor };
		const response: any = await apiRequest.call( this, 'GET', `webhooks/payloads/${webhookID}`, qs );

		data.payload = response;
	
		return {
			webhookResponse: { message: 'Workflow was started' },
			workflowData: [[{ json: data }]],
		};
	}

}
