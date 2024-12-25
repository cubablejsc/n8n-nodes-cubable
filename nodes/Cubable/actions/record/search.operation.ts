import {
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

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	baseID: string,
	tableID: string,
): Promise<INodeExecutionData[]> {
	const returnFieldsByFieldID: boolean
		= this.getNodeParameter( 'returnFieldsByFieldID', 0 ) as boolean;
	const response = await apiRequest.call( this, 'GET', 'records', {
		baseID,
		tableID,
		returnFieldsByFieldID,
	} );

	const expandCustomFields: boolean
		= this.getNodeParameter( 'expandCustomFields', 0 ) as boolean;
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

	return returnData;
}
