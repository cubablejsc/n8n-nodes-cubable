import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {
	NodeConnectionType,
} from 'n8n-workflow';

import {
	CUBABLE_TOKEN_API_CREDENTIAL_NAME as CBB_CREDENTIAL_NAME,
} from '../../credentials/CubableTokenApi.credentials';

import { listSearch } from './methods';
import { apiRequest } from './transport';

import * as record from './actions/record/Record.resource';

export class Cubable implements INodeType {

	description: INodeTypeDescription = {
		displayName: 'Cubable',
		name: 'cubable',
		icon: 'file:cubable.svg',
		group: [ 'transform' ],
		version: 1,
		description: 'Read, update, write and delete data from Cubable',
		defaults: { name: 'Cubable' },
		inputs: [ NodeConnectionType.Main ],
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

	methods = {
		listSearch,
	};


	async execute( this: IExecuteFunctions ): Promise<INodeExecutionData[][]> {
		const base: INodeParameterResourceLocator
			= this.getNodeParameter( 'base', 0 ) as INodeParameterResourceLocator;
		const table: INodeParameterResourceLocator
			= this.getNodeParameter( 'table', 0 ) as INodeParameterResourceLocator;
		const expandCustomFields: boolean
			= this.getNodeParameter( 'expandCustomFields', 0 ) as boolean;
		const returnFieldsByFieldID: boolean
			= this.getNodeParameter( 'returnFieldsByFieldID', 0 ) as boolean;
		const response = await apiRequest.call( this, 'GET', 'records', {
			baseID: base.value,
			tableID: table.value,
			returnFieldsByFieldID,
		} );

		const returnData: INodeExecutionData[] = [];

		for ( const record of response.data || [] ) {
			let json: any;

			if ( expandCustomFields ) {
				json = { ...record, ...record.customFields };

				delete json.customFields;
			} else {
				json = record;
			}

			returnData.push({ json });
		}

		return [ returnData ];
	}

}
