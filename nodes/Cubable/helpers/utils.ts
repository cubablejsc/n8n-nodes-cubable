import type {
    IDataObject,
    INodeExecutionData,
} from 'n8n-workflow';

export function flattenRecordCustomFields( record: IDataObject ) {
    const { customFields, ...rest } = record;

    return { ...rest, ...( customFields as IDataObject ) };
}

export function wrapData(
    data: IDataObject | IDataObject[]
): INodeExecutionData[] {
	return Array.isArray( data )
        ? data.map(( item: IDataObject ) => ({ json: item }))
        : [{ json: data }];
}
