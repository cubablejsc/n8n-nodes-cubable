import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequest } from '../transport';

export async function getFields( this: ILoadOptionsFunctions ): Promise<INodePropertyOptions[]> {
	const baseID = this.getNodeParameter( 'base', undefined, {
		extractValue: true,
	} ) as string;
	const tableID = this.getNodeParameter( 'table', undefined, {
		extractValue: true,
	} ) as string;

	const response = await apiRequest.call( this, 'GET', 'fields', { baseID, tableID } );
	const fields: IDataObject[] = response.data || [];

	if ( !fields.length ) {
		throw new NodeOperationError(
			this.getNode(),
			'No field could not be found!',
			{ level: 'warning' }
		);
	}

	const result: INodePropertyOptions[] = [];

	for ( const field of fields ) {
		result.push({
			name: field.name as string,
			value: field.id as string,
			description: field.description as string,
		});
	}

	return result;
}
