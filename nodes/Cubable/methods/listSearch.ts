import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

import { apiRequest } from '../transport';

const DEFAULT_PAGE_SIZE: number = 50;

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

	let results: INodeListSearchItems[] = [];

	if ( !response.data ) return { results };

	if ( filter ) {
		for ( const base of response.data ) {
			if ( base.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				results.push({
					name: base.name as string,
					value: base.id as string,
				});
			}
		}
	} else {
		results = response.data.map(
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
	const baseID = this.getNodeParameter( 'base', undefined, {
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

	let results: INodeListSearchItems[] = [];

	if ( !response.data ) return { results };

	if ( filter ) {
		for ( const table of response.data ) {
			if ( table.name?.toLowerCase().includes( filter.toLowerCase() ) ) {
				results.push({ name: table.name, value: table.id });
			}
		}
	} else {
		results = response.data.map(
			( table: { id: string; name: string } ) => ({
				name: table.name,
				value: table.id,
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
