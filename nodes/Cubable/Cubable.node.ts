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
			{
				displayName: 'Operator',
				name: 'operator',
				type: 'options',
				displayOptions: {
					show: {
						resource: [ 'record' ],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new record in a table',
					},
					{
						name: 'Create or update',
						value: 'upsert',
						description: 'Create a new record, or update the current one if it already exists (upsert)',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record from a table',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Retrieve a record from a table',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search for specific records or list all',
					},
					{
						name: 'Update',
						value: 'update', 
						description: 'Update a record in a table',
					},
				],
				default: 'create',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Base',
				name: 'base',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'baseSearch',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'Enter the Base ID',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '[0-7][0-9A-HJKMNP-TV-Z]{25}',
									errorMessage: 'Not a valid Cubable Base ID',
								},
							},
						],
					},
					{
						displayName: 'By URL',
						name: 'url',
						type: 'string',
						placeholder: 'e.g. https://open.cubable.com/v1/records?baseID=01JFF58A8P4BJX07A1Y4KBTXJ3',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: 'https://open.cubable.com/v1/records\\?baseID=([0-7][0-9A-HJKMNP-TV-Z]{25})',
									errorMessage: 'Not a valid Cubable Base URL',
								},
							},
						],
						extractValue: {
							type: 'regex',
							regex: 'https://open.cubable.com/v1/records\\?baseID=([0-7][0-9A-HJKMNP-TV-Z]{25})',
						},
					},
				],
			},
			{
				displayName: 'Table',
				name: 'table',
				type: 'resourceLocator',
				displayOptions: {
					hide: {
						base: ['']
					},
				},
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'tableSearch',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'Enter the Table ID',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '[0-7][0-9A-HJKMNP-TV-Z]{25}',
									errorMessage: 'Not a valid Cubable Table ID',
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Record ID',
				name: 'recordID',
				type: 'string',
				placeholder: 'e.g. 01JFF58A8P4BJX07A1Y4KBTXJ3',
				displayOptions: {
					show: {
						operator: [ 'get' ],
					},
				},
				default: '',
			},
			{
				displayName: 'Expand Custom Fields',
				name: 'expandCustomFields',
				type: 'boolean',
				description: 'Enable this option to convert nested custom fields into a flat structure in the output.',
				default: false,
			},
			{
				displayName: 'Return fields by Field ID',
				name: 'returnFieldsByFieldID',
				type: 'boolean',
				description: 'Enable this option to convert nested custom fields into a flat structure in the output.',
				default: false,
			},
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
