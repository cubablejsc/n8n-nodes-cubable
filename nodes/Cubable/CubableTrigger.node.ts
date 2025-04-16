import {
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { apiRequest } from './transport';
import { authentication, credential } from './descriptions/authentication.description';
import { resource, baseRLC, tableRLC } from './descriptions/common.description';
import { listSearch, loadOptions } from './methods';

const getResponseCode = () => {
	return 200;
};

export class CubableTrigger implements INodeType {

	description: INodeTypeDescription = {
		displayName: 'Cubable Trigger',
		name: 'cubableTrigger',
		icon: 'file:cubable.svg',
		group: [ 'trigger' ],
		version: 2,
		description: 'Starts the workflow when Cubable events occur',
		defaults: { name: 'Cubable Trigger' },
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node, n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [ NodeConnectionType.Main ],
		credentials: [{ ...credential }],
		properties: [
			authentication,
			resource,
			baseRLC,
			tableRLC,
			{
				displayName: 'Source Types',
				name: 'sourceTypes',
				type: 'multiOptions',
				default: [
					'User',
					'API',
					'Automation',
					'Form',
				],
				displayOptions: {
					show: {
						resource: [ 'record' ],
					},
					hide: {
						base: [ '' ],
						table: [ '' ],
					},
				},
				description: 'Specify the sources of events to listen for, such as user, api, automation, form',
				required: true,
				options: [
					{
						name: 'User',
						value: 'User',
					},
					{
						name: 'API',
						value: 'API',
					},
					{
						name: 'Automation',
						value: 'Automation',
					},
					{
						name: 'Form',
						value: 'Form',
					},
				],
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				default: [
					'records:create',
					'records:update',
					'records:delete',
				],
				displayOptions: {
					show: {
						resource: [ 'record' ],
					},
					hide: {
						base: [ '' ],
						table: [ '' ],
					},
				},
				description: 'Specify the types of events to listen for, such as record creation, updates, or deletion',
				required: true,
				options: [
					{
						name: 'Record Created',
						value: 'records:create',
					},
					{
						name: 'Record Updated',
						value: 'records:update',
					},
					{
						name: 'Record Deleted',
						value: 'records:delete',
					},
				],
			},
			{
				displayName: 'Additional Options',
				name: 'options',
				type: 'collection',
				default: {},
				description: 'Configure additional options to determine which records are included in the output',
				displayOptions: {
					show: {
						resource: [ 'record' ],
					},
					hide: {
						base: [ '' ],
						table: [ '' ],
					},
				},
				placeholder: 'Add option',
				options: [
					{
						displayName: 'Trigger on Specific Fields',
						name: 'eventOnRecordInFieldIDs',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getFieldsForTrigger',
						},
						default: [],
						// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
						description: 'The custom fields you want to include in the output',
					},
					{
						displayName: 'Include Specific Field Values',
						name: 'includeCellValuesInFieldIDs',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getFieldsForTrigger',
						},
						default: [],
						// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
						description: 'Specify the custom fields whose values should be included in the output',
					},
					{
						displayName: 'Include Previous Values',
						name: 'includePreviousValues',
						type: 'boolean',
						default: true,
						description: 'Whether to include the previous values of fields in the output when changes occur',
					},
				],
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				path: 'cubable-webhook',
				responseCode: `={{(${getResponseCode})()}}`
			},
		],
	};

	methods = { listSearch, loadOptions };

	webhookMethods = {
		'default': {
			checkExists: async function ( this: IHookFunctions ): Promise<boolean> {
				try {
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
				} catch ( error ) {
					throw new NodeOperationError( this.getNode(), error as Error );
				}
			},
			create: async function ( this: IHookFunctions) : Promise<boolean> {
				try {
					const baseID: string = this.getNodeParameter( 'base', undefined, {
						extractValue: true,
					} ) as string;
					const tableID: string = this.getNodeParameter( 'table', undefined, {
						extractValue: true,
					} ) as string;
					const webhookUrl: string = this.getNodeWebhookUrl( 'default' ) as string;
					const sourceTypes: string[] = this.getNodeParameter( 'sourceTypes' ) as string[];
					const eventTypes: string[] = this.getNodeParameter( 'eventTypes' ) as string[];
					const body: any = {
						notificationUrl: webhookUrl,
						params: {
							filters: {
								sourceTypes,
								eventTypes,
								eventOnTableIDs: [ tableID ],
							},
						},
					};

					const options: any = this.getNodeParameter( 'options', {} );

					if ( 'eventOnRecordInFieldIDs' in options ) {
						body.params.filters.eventOnRecordInFieldIDs = options.eventOnRecordInFieldIDs;
					}

					if ( 'includeCellValuesInFieldIDs' in options ) {
						body.params.includes ||= {};
						// temp fix: includeCellValuesInFieldIDs -> includeCellValuesInFieldIds (wait for api v2)
						body.params.includes.includeCellValuesInFieldIds = options.includeCellValuesInFieldIDs;
					}

					if ( 'includePreviousValues' in options ) {
						body.params.includes ||= {};
						body.params.includes.includePreviousValues = options.includePreviousValues;
					}

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
				} catch ( error ) {
					throw new NodeOperationError( this.getNode(), error as Error );
				}
			},
			delete: async function ( this: IHookFunctions ): Promise<boolean> {
				try {
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
				} catch ( error ) {
					throw new NodeOperationError( this.getNode(), error as Error );
				}
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

		try {
			const baseID: string = req.body.baseID;
			const webhookID: string = req.body.webhookID;
			const cursor: string = req.body.cursor;
			const qs: IDataObject = { baseID, cursor };
			const response: any = await apiRequest.call( this, 'GET', `webhooks/payloads/${webhookID}`, qs );

			data.payload = response;
		} catch {}
	
		return {
			webhookResponse: { message: 'Workflow was started' },
			workflowData: [[{ json: data }]],
		};
	}

}
