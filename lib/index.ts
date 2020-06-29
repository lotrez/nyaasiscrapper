'use strict'
import { numberCat, searchOptions, animeItem, file } from "./index.d";
import { numberCatValues, stringCatValues, argStringValues, argValues } from "./values"
import { serialize } from "v8";
const fetch = require('node-fetch');
var parser = require('fast-xml-parser');
var HTMLParser = require('node-html-parser');

const HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6",
    "cache-control": "max-age=0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "Cookie": "__ddg1=7wvAcwZ1UZURYCaMUOQ3; session=eyJjc3JmX3Rva2VuIjoiMzNmNzZmOGMxZDcyYzk3YmVhYmMxYjRlZTIzMzIyYmJhYjY5MDRjMiJ9.XvoLDQ.FX22V28ms6jBAIvZdZvLIZCPGT8",
    "upgrade-insecure-requests": "1"
}

const NYAA_URL = "https://nyaa.si"

function fetchTry(i, limit, itemArray, resolve) {
    fetch(itemArray[i]["nyaaUrl"])
        .then((response) => response.text())
        .then(
            (response) => advancedInfo(itemArray[i], response)
        )
        .then(() => {
            i++
            if(i<limit){
                fetchTry(i, limit, itemArray, resolve)
            }else if(i == limit){
                resolve(itemArray)
            }
        })
        .catch((error) => console.log(error))
}

export async function searchNyaa(options: searchOptions){
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
        }
        itemArray.push(item)
    });
    if(options.advanced){
        // advanced, need to get more info before returning
        if(itemArray.length < 14){
            // instant but gets rate limited > 14 requests
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
            var prom = new Promise<animeItem>((resolve, reject) => {
                fetchTry(0,itemArray.length,itemArray, resolve)
            })
            await prom
            return prom
        }
    }else{
        return itemArray
    }
}

/**
 * function that does the parsing of the nyaaUrl page
 * @param item 
 */
export function advancedInfo(item: animeItem, pageData: string):animeItem{
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
    let filesItems: file[] = []
    if (filePanel.childNodes[3].childNodes[1].childNodes[1].childNodes.length == 3){
        //  un fichier
        let fileTemp = filePanel.childNodes[3].childNodes[1].childNodes[1]
        let fileItem: file = {
            title: fileTemp.childNodes[1].rawText,
            size: fileTemp.childNodes[2].childNodes[0].rawText
        }
        filesItems.push(fileItem)
    }else{
        let filesDiv = filePanel.childNodes[3].childNodes[1].childNodes[1].childNodes[3]
        var filesDivChildren = filesDiv.childNodes
        filesDivChildren.forEach(childDiv => {
            if(childDiv.tagName == 'li'){
                let fileItem: file = {
                    title: childDiv.childNodes[1].rawText,
                    size: childDiv.childNodes[2].childNodes[0].rawText
                }
                filesItems.push(fileItem)
            }
        });
    }
    item["files"] = filesItems
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
        term: "Plunderer",
        // term: "[Arisaka] Plunderer - 24 VOSTFR [720p]",
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