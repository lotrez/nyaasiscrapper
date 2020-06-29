// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: Nyaasiscrapper
// Definitions by: lotrez, https://twitter.com/lotrezxd>

/*~ If this module has methods, declare them as functions like so.
 */

/**
 * General function, will give you results with your parameters, solwer with advanced and even slower if advanced and more than 14 results
 * @param options 
 */
export function searchNyaa(options: searchOptions): animeItem[];
/**
 * Advanced function, used to get info only available on the page itself, is called for every result when advanced is used in searchNyaa()
 * @param item 
 */
export function advancedInfo(item: animeItem): animeItem;

/**
 * @property {string} term - The term you want to search for, can be empty.
 * @property {stringCat | numberCat} category - Category, either in the form of '0_0' or 'All', can be empty.
 * @property {number} filter - filter 0 for none, 1 no remakes and 2 Trusted only, can be empty.
 * @property {string} user - User, can be empty.
 * @property {number} page - Page, can be empty.
 * @property {string} sortType - Sort type, can be seeders or any info, can be empty.
 * @property {string} sortDirection - Ascending or Descending, can be empty but defaults to descending.
 * @property {boolean} advanced - General scraping is by rss which means I don't get directlhy magnet, user, comments or files but if enabled it will see the page iteself to get it.
 */

export interface searchOptions {
    term?: string; 
    category?: stringCat | numberCat;
    filter?: 0 | 1 | 2;
    user?: string;
    page?: number;
    sortType?: "comments" | "size" | "Date" | "seeders" | "leechers" | "downloads" | "id";
    sortDirection?: "Ascending" | "Descending" | "desc" | "asc";
    advanced?: boolean;
}

export interface animeItem{
    title: string;
    category: numberCat;
    categoryId: stringCat;
    downloadUrl: string;
    size: string;
    date: Date;
    seeders: number;
    leechers: number;
    grabs: number;
    nyaaUrl: string;
    infoHash: string;
    trusted: boolean;
    remake: boolean;
    description?: string;
    magnet?: string;
    user?: string;
    files?: file[];
    comments?: comment[];
}

export interface file{
    title: string;
    size: string;
}

export interface comment{
    user: string;
    content: string;
    date: Date;
}

export declare type numberCat = 
    '0_0' |
    '1_1' |
    '1_2' |
    '1_3' |
    '1_4' |
    '2_1' |
    '2_2' |
    '3_1' |
    '3_2' |
    '3_3' |
    '4_1' |
    '4_2' |
    '4_3' |
    '4_4' |
    '5_1' |
    '5_2' |
    '6_1' |
    '6_2';

export declare type stringCat =
    'All' |
    'Anime' |
    'Anime Music Video' |
    'Anime English-translated' |
    'Anime Non-English-translated' |
    'Anime Raw' |
    'Audio' |
    'Lossless' |
    'Lossy' |
    'Literature' |
    'Literature English-translated' |
    'Literature Non-English-translated' |
    'Literature Raw' |
    'Live Action' |
    'Live Action English-translated' |
    'Idol/Promotional Video' |
    'Live Action Non-English-translated' |
    'Live Action Raw' |
    'Pictures' |
    'Graphics' |
    'Photos' |
    'Software' |
    'Applications' |
    'Games';

// /*~ If there are types, properties, or methods inside dotted names
//  *~ of the module, declare them inside a 'namespace'.
//  */
// export namespace subProp {
//     /*~ For example, given this definition, someone could write:
//      *~   import { subProp } from 'yourModule';
//      *~   subProp.foo();
//      *~ or
//      *~   import * as yourMod from 'yourModule';
//      *~   yourMod.subProp.foo();
//      */
//     export function foo(): void;
// }