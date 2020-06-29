# Nyaascrapper

[![npm version](https://badge.fury.io/js/nyaasiscrapper.svg)](https://www.npmjs.com/package/nyaasiscrapper)
Nyaascrapper is a simple tool to search and index nyaa.si

# Installation


```sh
$ npm install nyaascrapper
```

## Functions

| function | use |
| ------ | ------ |
| searchNyaa | main function that allows to search with parameters nyaa.si, returns animeItem[] |
| advancedInfo | Searches for advanced info that isn't on nyaa's rss feed, it has to query every page and scrape it so it might be slower |


## Using

#### searchNyaa()

```javascript
const nyaa = require('nyaasiscrapper')
var search = nyaa.searchNyaa(searchOptions);
search.then((results) => console.dir(results))
```

##### searchOptions

Every argument is optional, if you don't specify any you'll get the equivalent of the main page.

| property | type | meaning |
| ------ | ------ | ------ |
| term | string | the term you want to search
| category | Nyaa's categories, for more info go see the index.d.ts or the index.ts in github /src | A category of your choice
| filter | 0,1,2 | No filter, no remake, trusted only
| user | string | search a user's only torrents
| page | number | an index of a page
| sortType | go see the declaration too, also id == date | what you want to sort torrents by
| sortDirection | Ascending, Descending, desc, asc" | in what direction you want to sort torrents
| advanced | boolean | when true it will search every page for more info so it will be slower

Advanced gets the description, the user, the files and the magnet, comments are a WIP.

##### getAdvancedInfos()

This function takes a animeItem or an array of them and returns it with more advanced infos.

##### animeItem
animeItem is the type of result you get using this module.

| property | type | meaning 
| ------ | ------ | ------ |
| title | string | Torrent title
| category | string | category such as "English translated"
| categoryId | string | categoryId: '0_0' is all for example
| downloadUrl | string | torrent file url
| size | string | size followed by unit
| date | Date | Date format of upload time
| seeders | number | seeder amount
| leechers | number | leecher amount
| grabs | number | number of downloads
| nyaaUrl | string | url to nyaa page
| infoHash | string | infohash of torrent
| trusted | boolean | was the torrent uploaded by a trusted user
| remake | boolean | is the torrent a reupload
| description [advanced] | string | descriptino available on the torrent page
| magnet [advanced] | string | magnet link
| user [advanced] | string | uploader
| files [advanced] | file[] | array of files that have a title and size property
| comments [advanced] | not there yet | wip

## TO DO

* #### more tests
* #### better error handling (pretty much non existent)
* #### comment scrapping
