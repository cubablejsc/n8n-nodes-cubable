import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

import { apiRequest } from '../transport';

import { Base, Table, View } from '../helpers/types';

const DEFAULT_PAGE_SIZE: number = 50;
const cacheViews: Record<string, View[]> = {};

export async function baseSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: any
): Promise<INodeListSearchResult> {
	let page: number = 0;
	let pageSize: number = DEFAULT_PAGE_SIZE;
	let qs: IDataObject = {};

	if ( paginationToken ) {
		page = paginationToken.offset as number;

		qs = {
			sessionID: paginationToken.sessionID,
			page,
			pageSize,
		};
	}

	const response: any = await apiRequest.call( this, 'GET', 'bases', qs );
	const bases: Base[] = response.data || [];

	let results: INodeListSearchItems[] = [];

	if ( filter ) {
		for ( const base of bases ) {
			if ( base.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				results.push({ name: base.name, value: base.id });
			}
		}
	} else {
		results = bases.map(( base: Base ) => ({ name: base.name, value: base.id }));
	}

	return {
		results,
		paginationToken: {
			sessionID: response.sessionID,
			offset: page + pageSize,
		},
	};
};

export async function tableSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: any
): Promise<INodeListSearchResult> {
	const baseID: string = this.getNodeParameter( 'base', undefined, {
		extractValue: true,
	} ) as string;

	let page: number = 0;
	let pageSize: number = DEFAULT_PAGE_SIZE;
	let qs: IDataObject = { baseID };

	if ( paginationToken ) {
		page = paginationToken.offset as number;

		qs = {
			sessionID: paginationToken.sessionID,
			page,
			pageSize,
		};
	}

	const response: any = await apiRequest.call( this, 'GET', 'tables', qs );
	const tables: Table[] = response.data || [];

	let results: INodeListSearchItems[] = [];

	if ( filter ) {
		for ( const table of tables ) {
			if ( table.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				cacheViews[ table.id ] = table.views;

				results.push({ name: table.name, value: table.id });
			}
		}
	} else {
		results = tables.map(( table: Table ) => {
			cacheViews[ table.id ] = table.views;

			return { name: table.name, value: table.id };
		});
	}

	return {
		results,
		paginationToken: {
			sessionID: response.sessionID,
			offset: page + pageSize,
		},
	};
};

export async function viewSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: any
): Promise<INodeListSearchResult> {
	const tableID: string = this.getNodeParameter( 'table', undefined, {
		extractValue: true,
	} ) as string;

	let views: View[] = cacheViews[ tableID ];

	if ( !views ) {
		const baseID: string = this.getNodeParameter( 'base', undefined, {
			extractValue: true,
		} ) as string;

		let qs: IDataObject = { baseID };

		const response: any = await apiRequest.call( this, 'GET', `tables/${tableID}`, qs );

		views = response.data?.views;
	}

	views ||= [];

	let results: INodeListSearchItems[] = [];

	if ( filter ) {
		for ( const view of views ) {
			if ( view.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				results.push({ name: view.name, value: view.id });
			}
		}
	} else {
		results = views.map(( view: View ) => ({ name: view.name, value: view.id }));
	}

	return { results, paginationToken };
};
