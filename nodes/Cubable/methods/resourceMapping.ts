import {
	type ILoadOptionsFunctions,
	type ResourceMapperField,
	type ResourceMapperFields,
	NodeOperationError
} from 'n8n-workflow';

import { apiRequest } from '../transport';

import { Field } from '../types';

export async function getFields( this: ILoadOptionsFunctions ): Promise<ResourceMapperFields> {
	const baseID: string = this.getNodeParameter( 'base', undefined, {
		extractValue: true,
	} ) as string;
	const tableID: string = this.getNodeParameter( 'table', undefined, {
		extractValue: true,
	} ) as string;
	const requiredFieldByConfig: boolean
		= this.getNodeParameter( 'requiredFieldByConfig', undefined, {
			extractValue: true,
		} ) as boolean;

	const response = await apiRequest.call( this, 'GET', 'fields', { baseID, tableID } );
	const fields: Field[] = response.data || [];

	if ( !fields.length ) {
		throw new NodeOperationError(
			this.getNode(),
			'No field could not be found!',
			{ level: 'warning' }
		);
	}

	const mapperFields: ResourceMapperField[] = [];

	for ( const field of fields ) {
		mapperFields.push({
			id: field.id,
			displayName: `${field.name} (ID: ${field.id})`,
			defaultMatch: false,
			required: requiredFieldByConfig && field.isRequired,
			display: true,
		});
	}
	
	return { fields: mapperFields };
}
