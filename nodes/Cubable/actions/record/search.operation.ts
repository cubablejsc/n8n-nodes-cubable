import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions,
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { flattenRecordCustomFields, wait } from '../../helpers/utils';

import { viewRLC } from '../../descriptions/common.description';

import { fetchAdvancedOptions } from './common.description';

export const properties: INodeProperties[] = [
	viewRLC,
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				returnAll: [ false ],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	fetchAdvancedOptions,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'search' ],
		},
	},
	properties
);

const MAX_PAGE_SIZE: number = 50;

async function query(
	this: IExecuteFunctions,
	qs: IDataObject,
	limit: number = Infinity,
	_page: number = 1,
	_arr: IDataObject[] = []
): Promise<IDataObject[]> {
	const offset: number = ( _page - 1 ) * MAX_PAGE_SIZE;

	if ( offset < limit ) {
		qs.page = _page;
		qs.pageSize = Math.min( limit - offset, MAX_PAGE_SIZE );

		const response: any = await apiRequest.call( this, 'GET', 'records', qs );
		const data: IDataObject[] = response.data || [];

		_arr.push( ...data );

		if ( data.length === qs.pageSize ) {
			qs.sessionID = response.sessionID;

			await wait( 500 );
			await query.call( this, qs, limit, _page + 1, _arr );
		}
	}

	return _arr;
}

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	baseID: string,
	tableID: string,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const qs: IDataObject = { baseID, tableID };

	for ( let i: number = 0; i < items.length; i++ ) {
		try {
			const viewID: string = this.getNodeParameter( 'view', i, undefined, {
				extractValue: true,
			} ) as string;
		
			if ( viewID ) qs.viewID = viewID;

			const returnAll: boolean = this.getNodeParameter( 'returnAll', i ) as boolean;
			let limit!: number;

			if ( !returnAll ) {
				limit = this.getNodeParameter( 'limit', i ) as number;
			}

			const options: any = this.getNodeParameter( 'options', i, {} );

			if ( 'outputCustomFields' in options ) {
				qs.customFields = options.outputCustomFields.join( ',' );
			}

			if ( 'returnCustomFieldsByFieldID' in options ) {
				qs.returnFieldsByFieldID = options.returnCustomFieldsByFieldID;
			}

			let records: IDataObject[] = await query.call( this, qs, limit );

			records = records.map(( record: IDataObject ) => ({
				json: options.expandCustomFields
					? flattenRecordCustomFields( record )
					: record,
			}));

			const executionData: NodeExecutionWithMetadata[] =
				this.helpers.constructExecutionMetaData(
					records as INodeExecutionData[],
					{ itemData: { item: i } }
				);

			returnData.push( ...executionData );
		} catch ( error ) {
			if ( this.continueOnFail() ) {
				returnData.push({
					json: { message: error.message, error },
					pairedItem: { item: i },
				});
				continue;
			}

			throw error;
		}
	}

	return returnData;
}
