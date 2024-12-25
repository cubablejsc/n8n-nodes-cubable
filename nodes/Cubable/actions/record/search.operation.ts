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

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	baseID: string,
	tableID: string,
): Promise<INodeExecutionData[]> {
	const viewID: string = this.getNodeParameter( 'view', 0, undefined, {
		extractValue: true,
	} ) as string;
	const returnFieldsByFieldID: boolean
		= this.getNodeParameter( 'returnFieldsByFieldID', 0 ) as boolean;
	const qs: IDataObject = {
		baseID,
		tableID,
		returnFieldsByFieldID,
	};

	if ( viewID ) qs.viewID = viewID;

	const response = await apiRequest.call( this, 'GET', 'records', qs );

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
