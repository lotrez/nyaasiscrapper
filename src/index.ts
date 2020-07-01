'use strict'
import { numberCatValues, stringCatValues, argStringValues, argValues } from "./values"
const fetch = require('node-fetch');
var parser = require('fast-xml-parser');
var HTMLParser = require('node-html-parser');

const NYAA_URL = "https://nyaa.si"

function fetchTry(i: number, limit: number, itemArray: animeItem[], resolve: any) {
    fetch(itemArray[i]["nyaaUrl"])
        .then((response: any) => response.text())
        .then(
            (response: string) => advancedInfo(itemArray[i], response)
        )
        .then(() => {
            i++
            if(i<limit){
                fetchTry(i, limit, itemArray, resolve)
            }else if(i == limit){
                resolve(itemArray)
            }
        })
        .catch((error: string) => console.error(error))
}

/**
 * General function, will give you results with your parameters, solwer with advanced and even slower if advanced and more than 14 results
 * @param options
 */
export async function searchNyaa(options: searchOptions = {}){
    let optionsCleaned = cleanOptions(options)

    let optionsSerialized = serializeOptions(optionsCleaned)

    return new Promise<animeItem[]>(resolve => {
        fetch(NYAA_URL + optionsSerialized)
            .then((response: any) => response.text())
            .then((data:string) => {
                resolve(parseData(data, optionsCleaned))
            })
            .catch((error:string) => {
                throw(error);
            });

    })
}

async function parseData(data: string, options: searchOptions){
    let itemArray: animeItem[] = []
    let jsonData = parser.parse(data)
    try{
        if (jsonData["rss"]["channel"]["item"] == undefined){
            return[]
        }
    }catch{}
    jsonData = jsonData["rss"]["channel"]["item"]
    if (jsonData.length == undefined){
        // only one result
        jsonData = [jsonData]
    }
    jsonData.forEach((anime: any) => {
        var remake: boolean,trusted: boolean
        anime["nyaa:remake"] == 'No' ? remake = false : remake = true
        anime["nyaa:trusted"] == 'No' ? trusted = false : trusted = true
        let item: animeItem = {
            title: anime["title"],
            downloadUrl: anime["link"],
            nyaaUrl: anime["guid"],
            date: new Date(anime["pubDate"]),
            seeders: anime["nyaa:seeders"],
            leechers: anime["nyaa:leechers"],
            grabs: anime["nyaa:downloads"],
            infoHash: anime["nyaa:infoHash"],
            category: anime["nyaa:category"],
            categoryId: anime["nyaa:categoryId"],
            remake: remake,
            trusted: trusted,
            size: anime["nyaa:size"],
        }
        itemArray.push(item)
    });
    if(options.advanced){
        // advanced, need to get more info before returning
        return await getAdvancedInfos(itemArray)
    }else{
        return itemArray
    }
}

/**
 * Call that function with an animeItem or an array and you'll get more info
 * @param items 
 */
export async function getAdvancedInfos(items: animeItem[] | animeItem){
    // case of single element sent
    var itemArray: animeItem[] = (!Array.isArray(items)) ? [items] : items
    if (itemArray.length < 14) {
        // instant but gets rate limited > 14 requests
        var nArray = await Promise.all<animeItem>(
            itemArray.map(
                item => fetch(item["nyaaUrl"])
                    .then((response: any) => response.text())
                    .then(
                        (response: string) => advancedInfo(item, response)
                    )
                    .catch((error: string) => console.error(error))
            )
        )
        return (nArray)
    } else {
        var prom = new Promise<animeItem[]>((resolve, reject) => {
            fetchTry(0, itemArray.length, itemArray, resolve)
        })
        await prom
        return prom
    }
}

var ITERATION = 0

function parseFiles(fileParent: HTMLElement, emplacement: string = ""): file[]{
    ITERATION ++ 
    var fileArray: file[] = []

    // console.dir(emplacement)
    // single file case
    if(fileParent.childNodes.length == 3){
        fileArray = [{
            //@ts-ignore
            title: fileParent.childNodes[1].rawText,
            //@ts-ignore
            size: fileParent.childNodes[2].childNodes[0].rawText,
            parentDir: (emplacement == '') ? '/' : emplacement
        }]
        return fileArray
    }

    // more than one file, recursive calling of parseFiles
    for(let i = 0; i < fileParent.childNodes.length; i++){
        let div = fileParent.childNodes[i]
        switch (div.nodeType) {
            case 3:
                // who cares
                continue
                break;
            case 1:
                // either a folder or a file
                //@ts-ignore
                if(div.tagName == 'ul'){
                    continue
                }
                //@ts-ignore
                else if(div.attributes.class.includes('folder')){
                    //@ts-ignore
                    if(div.tagName == 'a'){
                        // for every <li> tag in the +2 div we need to call again

                        //@ts-ignore
                        for (let y = 0; y < fileParent.childNodes[i + 2].childNodes.length; y++){
                            if (fileParent.childNodes[i + 2].childNodes[y].nodeType == 3){
                                continue
                            }
                            //@ts-ignore
                            if (fileParent.childNodes[i + 2].childNodes[y].tagName == 'li'){
                                //@ts-ignore
                                let tempArray: file[] = parseFiles(fileParent.childNodes[i + 2].childNodes[y], emplacement + "/" + div.rawText)
                                fileArray = fileArray.concat(tempArray)
                            }
                        }
                    }
                    // console.dir(fileArray)
                }
                // else if(div.att)
                break;
            default:
                break;
        }
    }

    return fileArray
}

/**
 * Advanced function, used to get info only available on the page itself, is called for every result when advanced is used in searchNyaa()
 * @param item
 */
function advancedInfo(item: animeItem, pageData: string):animeItem{
    const root = HTMLParser.parse(pageData)
    // need to get magnet, user, files and comments
    let body = root.querySelectorAll("body")
    let panel = body[0].childNodes[4].childNodes[1]
    try{
        let user = panel.childNodes[3].childNodes[3].childNodes[3].childNodes[1].childNodes[0].rawText
        item["user"] = user
    }catch{
        item["user"] = "Anonymous"
    }
    let magnetAttrs = panel.childNodes[5].childNodes[3].rawAttrs
    let magnet = magnetAttrs.split('"')[1]
    item["magnet"] = magnet
    let descriptionPanel = body[0].childNodes[4].childNodes[3]
    let description = descriptionPanel.childNodes[1].childNodes[0].rawText
    item["description"] = description
    let filePanel = body[0].childNodes[4].childNodes[5]
    let fileParent = filePanel.childNodes[3].childNodes[1].childNodes[1]
    let commentsPanel = body[0].childNodes[4].childNodes[7]
    let comments: comment[] = parseComments(commentsPanel)
    item["comments"] = comments
    let filesItems: file[] = parseFiles(fileParent)
    item["files"] = filesItems
    return item
}

function parseComments(panel: HTMLElement): comment[]{
    var comments: comment[] = []
    var commentsDiv = panel.childNodes[3]
    commentsDiv.childNodes.forEach(commentDiv => {
        if(commentDiv.nodeType != 3){
            // nodeType 3 is wrong nodeType, fuck nodeTypes 3
            let avatarDiv = commentDiv.childNodes[1].childNodes[1]
            let contentDiv = commentDiv.childNodes[1].childNodes[3]
            // @ts-ignore
            let commentContent = contentDiv.childNodes[3].structuredText
            // @ts-ignore
            let date: string = contentDiv.childNodes[1].structuredText
            let edited = date.includes("(edited)")
            date = date.replace(' (edited)', '')
            let properDate: Date = new Date(date)
            // @ts-ignore
            let user = avatarDiv.structuredText
            let comment: comment = {
                "content": commentContent,
                "date": properDate,
                "user": user,
                "edited": edited
            }
            comments.push(comment)
        }
    })
    return comments
}

function serializeOptions(options: searchOptions):string{
    let optionString: string = '/?page=rss&'
    for(let propName in options){
        if(propName == "sortDirection"){
            switch (options[propName]) {
                case 'Ascending':
                    options[propName] = "asc"
                    break;
                default:
                    options[propName] = "desc"
                    break;
            }
        }
        if (propName != 'advanced'){
            optionString += `${argValues[argStringValues.indexOf(propName)]}=${options[propName]}&`
        }
    }
    return optionString
}

/**
 * I let a few literal values so I have to put them in real values now
 * @param options 
 */
function cleanOptions<searchOptions>(options: searchOptions){
    if(options['category'] != undefined){
        if(options['category'].length != 3){
            // not in x_x format
            let index = stringCatValues.indexOf(options['category'])
            options['category'] = numberCatValues[index]
        }
    }
    if (options['sortType'] == "Date"){
        options['sortType'] = "id"
    }
    return(options)
}

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

export interface animeItem {
    title: string;
    category: stringCat;
    categoryId: numberCat;
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

export interface file {
    title: string;
    size: string;
    parentDir: string;
}

export interface comment {
    user: string;
    content: string;
    date: Date;
    edited: boolean;
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
    'Anime - English-translated' |
    'Anime - Non-English-translated' |
    'Anime - Raw' |
    'Audio' |
    'Lossless' |
    'Lossy' |
    'Literature' |
    'Literature English-translated' |
    'Literature - Non-English-translated' |
    'Literature - Raw' |
    'Live Action' |
    'Live Action - English-translated' |
    'Idol/Promotional Video' |
    'Live Action - Non-English-translated' |
    'Live Action - Raw' |
    'Pictures' |
    'Graphics' |
    'Photos' |
    'Software' |
    'Applications' |
    'Games';