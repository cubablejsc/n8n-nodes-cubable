import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions,
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { wrapData } from '../../helpers/utils';

import { setRecordID } from '../common.description';

export const properties: INodeProperties[] = [
	setRecordID,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'deleteRecord' ],
		},
	},
	properties
);

const MAX_BATCH_SIZE: number = 20;

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	baseID: string,
	tableID: string,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const qs: IDataObject = { baseID, tableID };
	const batch: any = { indexes: [], data: [] };
	const itemsLength: number = items.length;

	for ( let i: number = 0; i < itemsLength; i++ ) {
		const recordID: boolean = this.getNodeParameter( 'recordID', i, undefined, {
			extractValue: true
		} ) as boolean;

		batch.indexes.push( i );
		batch.data.push( recordID );

		const n: number = i + 1;

		if ( n < itemsLength && n % MAX_BATCH_SIZE !== 0 ) continue;

		try {
			await apiRequest.call( this, 'DELETE', 'records', qs, { id: batch.data } );

			for ( let j: number = 0; j < batch.indexes.length; j++ ) {
				const idx: number = batch.indexes[ j ];
				const data: IDataObject = { id: batch.data[ j ] };
				const executionData: NodeExecutionWithMetadata[] =
					this.helpers.constructExecutionMetaData(
						wrapData( data ),
						{ itemData: { item: idx } },
					);

				returnData.push( ...executionData );
			}
		} catch ( error ) {
			if ( this.continueOnFail() ) {
				for ( const idx of batch.indexes ) {
					returnData.push({
						json: { message: error.message, error },
						pairedItem: { item: idx },
					});
				}
			} else {
				throw error;
			}
		}

		batch.indexes.length = 0;
		batch.data.length = 0;

		// @ts-ignore
		await new Promise( resolve => setTimeout( resolve, 1000 ) );
	}

	return returnData;
}
