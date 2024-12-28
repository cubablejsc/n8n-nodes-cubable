import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { flattenRecordCustomFields } from '../../helpers/utils';

import {
	getRecordFormatResults,
	viewRLC
} from '../common.description';

export const properties: INodeProperties[] = [
	viewRLC,
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		description: 'Whether to return all results or only up to a given limit',
		default: true,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				returnAll: [ false ],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
	},
	...getRecordFormatResults,
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
) {
	const offset: number = ( _page - 1 ) * MAX_PAGE_SIZE;

	if ( offset < limit ) {
		qs.page = _page;
		qs.pageSize = Math.min( limit - offset, MAX_PAGE_SIZE );

		const response = await apiRequest.call( this, 'GET', 'records', qs );
		const data = response.data || [];

		_arr.push( ...data );

		if ( data.length === qs.pageSize ) {
			qs.sessionID = response.sessionID;

			// @ts-ignore
			await new Promise( resolve => setTimeout( resolve, 500 ) );
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

	for ( let i = 0; i < items.length; i++ ) {
		try {
			const viewID: string = this.getNodeParameter( 'view', i, undefined, {
				extractValue: true,
			} ) as string;
		
			if ( viewID ) qs.viewID = viewID;

			const returnFieldsByFieldID: boolean
				= this.getNodeParameter( 'returnFieldsByFieldID', i ) as boolean;

			qs.returnFieldsByFieldID = returnFieldsByFieldID;

			const returnAll: boolean = this.getNodeParameter( 'returnAll', i ) as boolean;
			const limit: number = !returnAll
				? this.getNodeParameter( 'limit', i ) as number
				: Infinity;

			let records: any[] = await query.call( this, qs, limit );

			const expandCustomFields: boolean
				= this.getNodeParameter( 'expandCustomFields', i ) as boolean;

			records = records.map(( record: IDataObject ) => ({
				json: expandCustomFields
					? flattenRecordCustomFields( record )
					: record,
			}));

			const executionData: NodeExecutionWithMetadata[]
				= this.helpers.constructExecutionMetaData(
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
