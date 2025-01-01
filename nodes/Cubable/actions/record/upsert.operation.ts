import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type NodeExecutionWithMetadata,
	updateDisplayOptions,
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { removeIgnoredFields, wait, wrapData } from '../../helpers/utils';

import { ignoreFieldsOnAutoMapInputData } from './common.description';

export const properties: INodeProperties[] = [
	{
			displayName: 'Fields',
			name: 'fields',
			type: 'resourceMapper',
			default: {
				mappingMode: 'defineBelow',
				value: null,
			},
			displayOptions: {
				hide: {
					base: [ '' ],
					table: [ '' ],
				},
			},
			noDataExpression: true,
			required: true,
			typeOptions: {
				loadOptionsDependsOn: [
					'table.value',
					'base.value',
				],
				resourceMapper: {
					resourceMapperMethod: 'getFieldsWithRecordID',
					mode: 'upsert',
					fieldWords: {
						singular: 'field',
						plural: 'fields',
					},
					addAllFields: true,
					multiKeyMatch: true,
				},
			},
		},
		ignoreFieldsOnAutoMapInputData,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operation: [ 'upsert' ],
		},
	},
	properties
);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	baseID: string,
	tableID: string
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const qs: IDataObject = { baseID, tableID };
	const itemsLength: number = items.length;

	const dataMode: string = this.getNodeParameter( 'fields.mappingMode', 0 ) as string;

	for ( let i: number = 0; i < itemsLength; i++ ) {
		let id!: string;
		let customFields!: IDataObject;

		if ( dataMode === 'autoMapInputData' ) {
			const item: INodeExecutionData = items[ i ];
			const ignoreFields: string[] = this.getNodeParameter( 'ignoreFields', i ) as string[];

			id = item.json.id as string;
			customFields = removeIgnoredFields( item.json, ignoreFields );
		} else if ( dataMode === 'defineBelow' ) {
			const { id: _id, ...rest }: IDataObject =
				this.getNodeParameter( 'fields.value', i, [] ) as IDataObject;

			id = _id as string;
			customFields = rest;
		}

		try {
			let response: any;

			try {
				const updateData: IDataObject[] = [{ id, customFields }];

				response = await apiRequest.call( this, 'PATCH', 'records', qs, { data: updateData } );
			} catch ( error ) {
				if ( error.httpCode.includes( '404' )
					&& error.description.includes( 'The requested resource could not be found.' ) ) {
					const createData: IDataObject[] = [{ id, ...customFields }];

					response = await apiRequest.call( this, 'POST', 'records', qs, { data: createData } );
				} else {
					throw error;
				}
			}

			const data: IDataObject = { ...response.data, customFields };
			const executionData: NodeExecutionWithMetadata[] =
				this.helpers.constructExecutionMetaData(
					wrapData( data as IDataObject ),
					{ itemData: { item: i } },
				);

			returnData.push( ...executionData );
		} catch ( error ) {
			if ( this.continueOnFail() ) {
				returnData.push({
					json: { message: error.message, error },
				});
			} else {
				throw error;
			}
		}

		await wait( 1000 );
	}

	return returnData;
}
