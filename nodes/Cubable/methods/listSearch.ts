import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

import { apiRequest } from '../transport';

const DEFAULT_PAGE_SIZE: number = 50;
const cacheViews: Record<string, any[]> = {};

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
	const bases: any = response.data || [];

	let results: INodeListSearchItems[] = [];

	if ( filter ) {
		for ( const base of bases ) {
			if ( base.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				results.push({
					name: base.name as string,
					value: base.id as string,
				});
			}
		}
	} else {
		results = bases.map(
			( base: { id: string; name: string } ) => ({
				name: base.name,
				value: base.id,
			})
		);
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
	const tables: any = response.data || [];

	let results: INodeListSearchItems[] = [];

	if ( filter ) {
		for ( const table of tables ) {
			if ( table.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				cacheViews[ table.id ] = table.views;

				results.push({ name: table.name, value: table.id });
			}
		}
	} else {
		results = tables.map(
			( table: { id: string; name: string, views: any[] } ) => {
				cacheViews[ table.id ] = table.views;

				return { name: table.name, value: table.id };
			}
		);
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
	const table: any = this.getNodeParameter( 'table', undefined );
	const views: any[] = cacheViews[ table.value ] || [];

	let results: INodeListSearchItems[] = [];

	if ( filter ) {
		for ( const view of views ) {
			if ( view.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				results.push({ name: view.name, value: view.id });
			}
		}
	} else {
		results = views.map(
			( view: { id: string; name: string } ) => ({
				name: view.name,
				value: view.id,
			})
		);
	}

	return { results, paginationToken };
};
