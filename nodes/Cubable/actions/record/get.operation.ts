import {
	type INodeProperties,
	type IExecuteFunctions,
	type INodeExecutionData,
	updateDisplayOptions
} from 'n8n-workflow';

import { apiRequest } from '../../transport';

import { getRecordFormatResults } from '../common.description';

export const properties: INodeProperties[] = [
	{
		displayName: 'Record ID',
		name: 'recordID',
		type: 'string',
		placeholder: 'e.g. 01JFF58A8P4BJX07A1Y4KBTXJ3',
		default: '',
		required: true,
	},
	...getRecordFormatResults,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'get' ],
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
	const recordID: boolean = this.getNodeParameter( 'recordID', 0, undefined, {
		extractValue: true
	} ) as boolean;
	const returnFieldsByFieldID: boolean
		= this.getNodeParameter( 'returnFieldsByFieldID', 0 ) as boolean;
	const response = await apiRequest.call( this, 'GET', `records/${recordID}`, {
		baseID,
		tableID,
		returnFieldsByFieldID,
	} );

	const record: any = response.data;
	const expandCustomFields: boolean
		= this.getNodeParameter( 'expandCustomFields', 0 ) as boolean;

	let json: any;

	if ( expandCustomFields ) {
		json = { ...record, ...record.customFields };

		delete json.customFields;
	} else {
		json = record;
	}

	return [{ json }];
}
