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

async function query(
	this: IExecuteFunctions,
	qs: IDataObject,
	_page: number = 1,
	_arr: any[] = []
) {
	qs.page = _page;

	const response = await apiRequest.call( this, 'GET', 'records', qs );
	const data = response.data || [];

	_arr.push( ...data );

	if ( data.length === qs.pageSize ) {
		qs.sessionID = response.sessionID;

		// @ts-ignore
		await new Promise( resolve => setTimeout( resolve, 500 ) );
		await query.call( this, qs, _page + 1, _arr );
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
		pageSize: 50,
	};

	const viewID: string = this.getNodeParameter( 'view', 0, undefined, {
		extractValue: true,
	} ) as string;

	if ( viewID ) qs.viewID = viewID;

	const records = await query.call( this, qs );

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
