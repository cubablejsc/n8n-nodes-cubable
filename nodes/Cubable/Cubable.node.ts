import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {
	NodeConnectionType,
} from 'n8n-workflow';

import {
	CUBABLE_TOKEN_API_CREDENTIAL_NAME as CBB_CREDENTIAL_NAME,
} from '../../credentials/CubableTokenApi.credentials';

import { listSearch, loadOptions, resourceMapping } from './methods';
import { router } from './actions/router';
import * as record from './actions/record/Record.resource';

export class Cubable implements INodeType {

	description: INodeTypeDescription = {
		displayName: 'Cubable',
		name: 'cubable',
		icon: 'file:cubable.svg',
		group: [ 'transform' ],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Read, update, write and delete data from Cubable',
		defaults: { name: 'Cubable' },
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [ NodeConnectionType.Main ],
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					// { name: 'Base', value: 'base' },
					// { name: 'Table', value: 'table' },
					// { name: 'Field', value: 'field' },
					{ name: 'Record', value: 'record' },
				],
				default: 'record',
				noDataExpression: true,
				required: true,
			},
			...record.description,
		],
	};

	methods = { listSearch, loadOptions, resourceMapping };

	async execute( this: IExecuteFunctions ): Promise<INodeExecutionData[][]> {
		return await router.call( this );
	}

}
