import {
	IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	updateDisplayOptions
} from 'n8n-workflow';

import { apiRequest } from '../../transport';

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
	_arr: any[] = []
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
	const returnFieldsByFieldID: boolean
		= this.getNodeParameter( 'returnFieldsByFieldID', 0 ) as boolean;
	const qs: IDataObject = {
		baseID,
		tableID,
		returnFieldsByFieldID,
	};

	const viewID: string = this.getNodeParameter( 'view', 0, undefined, {
		extractValue: true,
	} ) as string;

	if ( viewID ) qs.viewID = viewID;

	const returnAll: boolean = this.getNodeParameter( 'returnAll', 0 ) as boolean;
	let limit: number = Infinity;

	if ( !returnAll ) {
		limit = this.getNodeParameter( 'limit', 0 ) as number;
	}

	const records = await query.call( this, qs, limit );

	const expandCustomFields: boolean
		= this.getNodeParameter( 'expandCustomFields', 0 ) as boolean;
	const returnData: INodeExecutionData[] = [];

	for ( const record of records ) {
		let json: any;

		if ( expandCustomFields ) {
			json = { ...record, ...record.customFields };

			delete json.customFields;
		} else {
			json = record;
		}

		returnData.push({ json });
	}

	return returnData;
}
