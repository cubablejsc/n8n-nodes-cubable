import {
	type FieldType,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type ResourceMapperField,
	type ResourceMapperFields,
	NodeOperationError
} from 'n8n-workflow';

import { apiRequest } from '../transport';

import { Field } from '../helpers/types';

enum CBBFieldType {
	Text = 1,
	Checkbox = 2,
	Paragraph = 3,
	Attachment = 4,
	Dropdown = 5,
	Number = 6,
	Date = 7,
	Phone = 8,
	Link = 9,
	Email = 10,
	Currency = 11,
	People = 12,
	Rating = 13,
	Progress = 14,
	Reference = 15,
	Formula = 16,
	Lookup = 18,
	LastModifiedBy = 19,
	LastModifiedTime = 20,
	CreatedBy = 21,
	CreatedTime = 22,
	AutoNumber = 23,
};

const FIELD_TYPE_MAP: Record<number, FieldType> = {
	[ CBBFieldType.Checkbox ]: 'boolean',
	[ CBBFieldType.Number ]: 'number',
	[ CBBFieldType.Date ]: 'dateTime',
	[ CBBFieldType.Currency ]: 'number',
	[ CBBFieldType.People ]: 'array',
	[ CBBFieldType.Rating ]: 'number',
	[ CBBFieldType.Progress ]: 'number',
	[ CBBFieldType.Reference ]: 'array',
};
const UNSUPPORT_FIELD_TYPE_MAP: Record<number, boolean> = {
	[ CBBFieldType.Attachment ]: true,
	[ CBBFieldType.Formula ]: true,
	[ CBBFieldType.Lookup ]: true,
	[ CBBFieldType.LastModifiedBy ]: true,
	[ CBBFieldType.LastModifiedTime ]: true,
	[ CBBFieldType.CreatedBy ]: true,
	[ CBBFieldType.CreatedTime ]: true,
	[ CBBFieldType.AutoNumber ]: true,
};

export async function getFields( this: ILoadOptionsFunctions ): Promise<ResourceMapperFields> {
	const baseID: string = this.getNodeParameter( 'base', undefined, {
		extractValue: true,
	} ) as string;
	const tableID: string = this.getNodeParameter( 'table', undefined, {
		extractValue: true,
	} ) as string;
	// const requiredFieldByConfig: boolean =
	// 	this.getNodeParameter( 'requiredFieldByConfig', undefined, {
	// 		extractValue: true,
	// 	} ) as boolean;

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
		let type: FieldType = FIELD_TYPE_MAP[ field.dataType ] || 'string';
		let options: INodePropertyOptions[] = [];

		if ( field.dataType === CBBFieldType.Dropdown ) {
			if ( field.params.isMultipleSelect ) {
				type = 'array';
			} else {
				type = 'options';
				options = field.params.options;
			}
		}

		const unsupport: boolean = UNSUPPORT_FIELD_TYPE_MAP[ field.dataType ] || false;

		mapperFields.push({
			// id: field.id,
			id: field.name,
			displayName: `${field.name} (ID: ${field.id})`,
			// required: requiredFieldByConfig && field.isRequired,
			required: false,
			defaultMatch: false,
			canBeUsedToMatch: true,
			display: true,
			type,
			options,
			readOnly: unsupport,
			removed: unsupport,
		});
	}
	
	return { fields: mapperFields };
}
