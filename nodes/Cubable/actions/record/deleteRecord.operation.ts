import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions,
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { Batch } from '../../helpers/types';
import { batchExecute, wrapData } from '../../helpers/utils';

import { recordIDInput } from './common.description';

export const properties: INodeProperties[] = [
	recordIDInput,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'deleteRecord' ],
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
	const batch: Batch = { indexes: [], data: [], length: 0 };
	const itemsLength: number = items.length;

	for ( let i: number = 0; i < itemsLength; i++ ) {
		const recordID: string = this.getNodeParameter( 'recordID', i, undefined, {
			extractValue: true,
		} ) as string;

		batch.indexes.push( i );
		batch.data.push( recordID );
		batch.length++;

		await batchExecute(
			async () => {
				try {
					await apiRequest.call( this, 'DELETE', 'records', qs, { id: batch.data } );

					for ( let j: number = 0; j < batch.length; j++ ) {
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
						returnData.push({
							json: { message: error.message, error },
						});
					} else {
						throw error;
					}
				}

				batch.indexes.length = 0;
				batch.data.length = 0;
			},
			i,
			itemsLength
		);
	}

	return returnData;
}
