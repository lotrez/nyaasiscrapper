'use strict'
import { numberCat, searchOptions, animeItem } from "./index.d";
import { numberCatValues, stringCatValues, argStringValues, argValues } from "./values"
import { serialize } from "v8";
const fetch = require('node-fetch');
var parser = require('fast-xml-parser');
var HTMLParser = require('node-html-parser');


const NYAA_URL = "https://nyaa.si"

export default async function searchNyaa(options: searchOptions){
    let optionsCleaned = cleanOptions(options)

    let optionsSerialized = serializeOptions(optionsCleaned)
    console.log(optionsSerialized)
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

async function parseData(data: string, options: searchOptions){
    let itemArray: animeItem[] = []
    let jsonData = parser.parse(data)
    jsonData = jsonData["rss"]["channel"]["item"]
    if (jsonData.length == undefined){
        // only one result
        jsonData = [jsonData]
    }
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
        var nArray = await Promise.all(
            itemArray.map(
                item => fetch(item["nyaaUrl"])
                .then((response) => response.text())
                .then(
                    (response) => advancedInfo(item, response)
                )
            )
        )
        return(nArray)
    }else{
        return itemArray
    }
}

/**
 * function that does the parsing of the nyaaUrl page
 * @param item 
 */
function advancedInfo(item: animeItem, pageData: string):animeItem{
    const root = HTMLParser.parse(pageData)
    // console.log(pageData)
    // console.log(root.firstChild.structure);
    // need to get magnet, user, files and comments
    let userDiv = root.querySelectorAll("body")
    console.dir(userDiv)
    item["user"] = userDiv[0].innerHTML
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
        term: "[Arisaka] Plunderer - 24 VOSTFR [720p]",
        // category: "Anime English-translated",
        // filter: 0,
        // user: "NoobSubs",
        page: 0,
        sortType: "comments",
        sortDirection: "Descending",
        advanced: true
    }
    searchNyaa(searchTest).then(response => console.dir(response))
}

main()