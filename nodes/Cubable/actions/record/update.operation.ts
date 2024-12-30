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
import {
	batchExecute,
	removeIgnoredFields,
	wrapData,
} from '../../helpers/utils';

import { createOrUpdateOptions } from '../common.description';

export const properties: INodeProperties[] = [
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'resourceMapper',
		displayOptions: {
			hide: {
				base: [ '' ],
				table: [ '' ],
			},
		},
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		required: true,
		typeOptions: {
			loadOptionsDependsOn: [
				'operator',
				'table.value',
				'base.value',
				'requiredFieldByConfig',
			],
			resourceMapper: {
				resourceMapperMethod: 'getFieldsWithRecordID',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: true,
				multiKeyMatch: true,
			},
		},
	},
	...createOrUpdateOptions,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'update' ],
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
	const batch: Batch = { indexes: [], data: [] };
	const itemsLength: number = items.length;

	const dataMode: string = this.getNodeParameter( 'fields.mappingMode', 0 ) as string;

	for ( let i: number = 0; i < itemsLength; i++ ) {
		let recordID!: string;
		let fields!: IDataObject;

		if ( dataMode === 'autoMapInputData' ) {
			const item: INodeExecutionData = items[ i ];
			const ignoreFields: string[] = this.getNodeParameter( 'ignoreFields', i ) as string[];

			recordID = item.json.id as string;
			fields = removeIgnoredFields( item.json, ignoreFields );
		} else if ( dataMode === 'defineBelow' ) {
			const { id, ...rest }: IDataObject =
				this.getNodeParameter( 'fields.value', i, [] ) as IDataObject;

			recordID = id as string;
			fields = rest;
		}

		batch.indexes.push( i );
		batch.data.push({ id: recordID, customFields: fields });

		await batchExecute(
			async () => {
				try {
					const response: any = await apiRequest.call( this, 'PATCH', 'records', qs, { data: batch.data } );
		
					for ( let j: number = 0; j < batch.indexes.length; j++ ) {
						const idx: number = batch.indexes[ j ];
						const data: IDataObject = {
							...response.data[ j ],
							customFields: batch.data[ j ].customFields,
						};
						const executionData: NodeExecutionWithMetadata[] =
							this.helpers.constructExecutionMetaData(
								wrapData( data as IDataObject ),
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
			},
			i,
			itemsLength
		);
	}

	return returnData;
}
