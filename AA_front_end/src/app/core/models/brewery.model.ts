export interface Brewery{
    id: string;
    name: string;
    brewery_type: string;
    city: string;
    phone: string;
    street: string
}

export interface SearchHistory extends Brewery{
    displayTimestamp: string;
}