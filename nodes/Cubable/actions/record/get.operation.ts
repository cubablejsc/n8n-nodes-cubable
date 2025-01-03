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

import { fetchAdvancedOptions, recordIDInput } from './common.description';

export const properties: INodeProperties[] = [
	recordIDInput,
	fetchAdvancedOptions,
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
			const recordID: string = this.getNodeParameter( 'recordID', i, undefined, {
				extractValue: true,
			} ) as string;

			const options: any = this.getNodeParameter( 'options', i, {} );

			if ( 'outputCustomFields' in options ) {
				qs.customFields = options.outputCustomFields.join( ',' );
			}

			if ( 'returnCustomFieldsByFieldID' in options ) {
				qs.returnFieldsByFieldID = options.returnCustomFieldsByFieldID;
			}

			const response: any = await apiRequest.call( this, 'GET', `records/${recordID}`, qs );

			let record: IDataObject = response.data;

			if ( options.expandCustomFields ) {
				record = flattenRecordCustomFields( record );
			}

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
