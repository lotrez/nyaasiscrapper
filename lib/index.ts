'use strict'
import { numberCat, searchOptions, item } from "./index.d";
import { numberCatValues, stringCatValues, argStringValues, argValues } from "./values"
import { serialize } from "v8";
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const NYAA_URL = "https://nyaa.si"

export default async function searchNyaa(options: searchOptions){
    let optionsCleaned = cleanOptions(options)

    let optionsSerialized = serializeOptions(optionsCleaned)
    console.log(optionsSerialized)
    await fetch(NYAA_URL + optionsSerialized)
        .then((response) => response.text())
        .then(data => {
            // console.log(data)
            return parseData(data, optionsCleaned);
        })
        .catch(error => {
            throw(error);
        });
}

function parseData(data: string, options: searchOptions): item[]{
    let itemArray: item[] = []
    const dom: any = new JSDOM(data)
    let htmlItems = dom.window.document.getElementsByTagName('tr')
    let items = Array.prototype.slice.call(htmlItems)
    items.forEach(item => {
        // console.log(item)
        let children = item.children
        children = Array.prototype.slice.call(children) 
        if(children.length == 9){
            children.splice(1,2)
        }
        console.dir(children)
        let links = children[2].children
        let nyaaLink = children[1]
        console.log(children[1].firstChild.nextSibling.nextSibling.textContent)
        // console.table(children[1].href)
        // console.dir(Object.keys(nyaaLink))
        // for (var key in nyaaLink) {
        //     if (nyaaLink.hasOwnProperty(key)) {
        //         console.log(key)
        //     }
        // }
        // // console.table(nyaaLink[nyaaLink.length - 1].innerText)
        // console.table(nyaaLink[nyaaLink.length - 1].href)
        var result: item = {
            title: children[1].lastChild.wholeText,
            category: options['category'],
            magnet: links[1].href,
            downloadUrl: NYAA_URL + links[0].href,
            size: children[3].innerText,
            date: new Date(children[4].innerHTML),
            seeders: parseInt(children[5].innerHTML),
            leechers: parseInt(children[5].innerHTML),
            grabs: parseInt(children[6].innerHTML),
            nyaaUrl: "nyaaLink[0].href"
        }
        console.dir(result)
    });
    return itemArray
}

function serializeOptions(options: searchOptions):string{
    let optionString: string = '/'
    if(options['user']){
        optionString += "user/" + options['user']
    }
    optionString += "?"
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
        if (propName != 'user' && propName != 'advanced'){
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
        // user: "NoobSubs",
        page: 0,
        sortType: "comments",
        sortDirection: "Descending"
    }
    searchNyaa(searchTest)
}

main()