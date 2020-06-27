'use strict'
import { numberCat, searchOptions, animeItem } from "./index.d";
import { numberCatValues, stringCatValues, argStringValues, argValues } from "./values"
import { serialize } from "v8";
const fetch = require('node-fetch');
var parser = require('fast-xml-parser');

const NYAA_URL = "https://nyaa.si"

export default async function searchNyaa(options: searchOptions){
    let optionsCleaned = cleanOptions(options)

    let optionsSerialized = serializeOptions(optionsCleaned)
    return new Promise(resolve => {
        fetch(NYAA_URL + optionsSerialized)
            .then((response) => response.text())
            .then(data => {
                resolve(parseData(data, optionsCleaned))
            })
            .catch(error => {
                throw(error);
            });

    })
}

function parseData(data: string, options: searchOptions): animeItem[]{
    let itemArray: animeItem[] = []
    let jsonData = parser.parse(data)
    jsonData = jsonData["rss"]["channel"]["item"]
    // console.dir(jsonData)
    jsonData.forEach(anime => {
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
            remake: anime["nyaa:remake"],
            trusted: anime["nyaa:trusted"],
            size: anime["nyaa:size"],
            description: anime["description"]
        }
        itemArray.push(item)
    });
    if(options.advanced){
        // advanced, need to get more info before returning
        var nArray = Promise.all(
            itemArray.map(
                item => fetch(item["nyaaUrl"]).then(
                    (response) => advancedInfo(response)
                )
            )
        )
    }else{
        return itemArray
    }
}

function advancedInfo(item: animeItem):animeItem{

    return item
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
    if(options['category']){
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

function main(){
    let searchTest: searchOptions = {
        term: "attack on titan",
        category: "Anime English-translated",
        filter: 0,
        user: "NoobSubs",
        page: 0,
        sortType: "comments",
        sortDirection: "Descending"
    }
    searchNyaa(searchTest).then(response => console.dir(response))
}

main()