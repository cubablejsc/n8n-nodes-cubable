import type { INodeProperties } from 'n8n-workflow';

export const baseRLC: INodeProperties = {
	displayName: 'Base',
	name: 'base',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'baseSearch',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'Enter the Base ID',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[0-7][0-9A-HJKMNP-TV-Z]{25}',
						errorMessage: 'Not a valid Cubable Base ID',
					},
				},
			],
		},
	],
};

export const tableRLC: INodeProperties = {
	displayName: 'Table',
	name: 'table',
	type: 'resourceLocator',
	required: true,
	displayOptions: {
		hide: {
			base: [ '' ],
		},
	},
	typeOptions: {
		loadOptionsDependsOn: [ 'base.value' ],
	},
	default: { mode: 'list', value: '' },
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'tableSearch',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'Enter the Table ID',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[0-7][0-9A-HJKMNP-TV-Z]{25}',
						errorMessage: 'Not a valid Cubable Table ID',
					},
				},
			],
		},
	],
};

export const viewRLC: INodeProperties = {
	displayName: 'View',
	name: 'view',
	type: 'resourceLocator',
	displayOptions: {
		hide: {
			base: [ '' ],
			table: [ '' ],
		},
	},
	typeOptions: {
		loadOptionsDependsOn: [ 'base.value', 'table.value' ],
	},
	default: { mode: 'list', value: '' },
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'viewSearch',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'Enter the View ID',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[0-7][0-9A-HJKMNP-TV-Z]{25}',
						errorMessage: 'Not a valid Cubable View ID',
					},
				},
			],
		},
	],
};

export const getRecordFormatResults: INodeProperties[] = [
	{
		displayName: 'Expand Custom Fields',
		name: 'expandCustomFields',
		type: 'boolean',
		description: 'Whether enable this option to convert nested custom fields into a flat structure in the output',
		default: false,
	},
	{
		displayName: 'Return by Field ID',
		name: 'returnFieldsByFieldID',
		type: 'boolean',
		description: 'Whether enable this option to return custom fields by their field IDs in the output',
		default: false,
	},
];
