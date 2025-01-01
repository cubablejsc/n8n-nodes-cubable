import type { INodeProperties } from 'n8n-workflow';

export const resource: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	default: 'record',
	noDataExpression: true,
	required: true,
	options: [
		// { name: 'Base', value: 'base' },
		// { name: 'Table', value: 'table' },
		// { name: 'Field', value: 'field' },
		{ name: 'Record', value: 'record' },
	],
};

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
	default: { mode: 'list', value: '' },
	displayOptions: {
		hide: {
			base: [ '' ],
		},
	},
	required: true,
	typeOptions: {
		loadOptionsDependsOn: [ 'base.value' ],
	},
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
	default: { mode: 'list', value: '' },
	displayOptions: {
		hide: {
			base: [ '' ],
			table: [ '' ],
		},
	},
	typeOptions: {
		loadOptionsDependsOn: [ 'base.value', 'table.value' ],
	},
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
