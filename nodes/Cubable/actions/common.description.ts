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

export const setRecordID: INodeProperties = {
	displayName: 'Record ID',
	name: 'recordID',
	type: 'string',
	placeholder: 'e.g. 01JFF58A8P4BJX07A1Y4KBTXJ3',
	default: '',
	required: true,
};

export const fetchRecordOptions: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		default: {},
		description: 'Additional options which decide which records should be returned',
		placeholder: 'Add option',
		options: [
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
				displayName: 'Output Custom Fields',
				name: 'outputCustomFields',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getFields',
					loadOptionsDependsOn: [ 'base.value', 'table.value' ],
				},
				default: [],
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
				description: 'The custom fields you want to include in the output',
			},
			{
				displayName: 'Expand Custom Fields',
				name: 'expandCustomFields',
				type: 'boolean',
				description: 'Whether enable this option to convert nested custom fields into a flat structure in the output',
				default: true,
			},
			{
				displayName: 'Return by Custom Field ID',
				name: 'returnCustomFieldsByFieldID',
				type: 'boolean',
				description: 'Whether enable this option to return custom fields by their field IDs in the output',
				default: true,
			},
		],
	},
];

export const createOrUpdateRecordOptions: INodeProperties[] = [
	{
		displayName: 'Ignore Fields From Input',
		name: 'ignoreFields',
		type: 'multiOptions',
		displayOptions: {
			show: {
				'/fields.mappingMode': [ 'autoMapInputData' ],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		default: [],
		typeOptions: {
			loadOptionsMethod: 'getFields',
		},
	},
	{
		displayName: 'Required Input Based on Field Config',
		name: 'requiredFieldByConfig',
		type: 'boolean',
		displayOptions: {
			show: {
				'/fields.mappingMode': [ 'defineBelow' ],
			},
		},
		description: 'Whether enable this option to make the input required if the field is marked as required in the configuration',
		default: false,
	},
];
