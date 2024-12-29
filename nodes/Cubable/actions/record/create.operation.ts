import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { wrapData } from '../../helpers/utils';

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
			loadOptionsDependsOn: [ 'table.value', 'base.value' ],
			resourceMapper: {
				resourceMapperMethod: 'getFields',
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
	// {
	// 	displayName: 'Required Input Based on Field Config',
	// 	name: 'requiredFieldByConfig',
	// 	type: 'boolean',
	// 	description: 'Whether enable this option to make the input required if the field is marked as required in the configuration',
	// 	default: false,
	// },
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'create' ],
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
		const dataMode: string = this.getNodeParameter( 'fields.mappingMode', i ) as string;

		let fields!: IDataObject;

		if ( dataMode === 'defineBelow' ) {
			fields = this.getNodeParameter( 'fields.value', i, [] ) as IDataObject;

			batch.indexes.push( i );
			batch.data.push( fields );
		}

		const n: number = i + 1;

		if ( n < itemsLength && n % MAX_BATCH_SIZE !== 0 ) continue;

		try {
			const response: any = await apiRequest.call( this, 'POST', 'records', qs, { data: batch.data } );

			for ( let j: number = 0; j < batch.indexes.length; j++ ) {
				const idx: number = batch.indexes[ j ];
				const data: IDataObject = {
					...response.data[ j ],
					customFields: batch.data[ j ],
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

		// @ts-ignore
		await new Promise( resolve => setTimeout( resolve, 1000 ) );
	}

	return returnData;
}
