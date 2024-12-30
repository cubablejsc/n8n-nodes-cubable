import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions,
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { flattenRecordCustomFields, wrapData } from '../../helpers/utils';

import { getRecordFormatResults, setRecordID } from '../common.description';

export const properties: INodeProperties[] = [
	setRecordID,
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
	const returnData: INodeExecutionData[] = [];
	const qs: IDataObject = { baseID, tableID };

	for ( let i: number = 0; i < items.length; i++ ) {
		try {
			const returnFieldsByFieldID: boolean =
				this.getNodeParameter( 'returnFieldsByFieldID', i ) as boolean;

			qs.returnFieldsByFieldID = returnFieldsByFieldID;

			const recordID: boolean = this.getNodeParameter( 'recordID', i, undefined, {
				extractValue: true
			} ) as boolean;

			const response: any = await apiRequest.call( this, 'GET', `records/${recordID}`, qs );

			let record: IDataObject = response.data;

			const expandCustomFields: boolean =
				this.getNodeParameter( 'expandCustomFields', i ) as boolean;

			record = expandCustomFields
				? flattenRecordCustomFields( record )
				: record;

			const executionData: NodeExecutionWithMetadata[] =
				this.helpers.constructExecutionMetaData(
					wrapData( record ),
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
