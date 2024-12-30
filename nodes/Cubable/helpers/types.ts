export type Batch = { indexes: number[]; data: any[]; length: number; };

export type Base = { id: string; name: string };

export type Table = { id: string; name: string; views: View[] };

export type View = { id: string; name: string };

export type Field = {
    id: string;
    name: string;
    description: string;
    dataType: number;
    isRequired: boolean;
    params: any;
};
