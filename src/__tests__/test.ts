import { searchNyaa, searchOptions, animeItem } from "../index"

test('75 results', () => {
    var data = searchNyaa({
        "term": "attack on titan"
    }).then((val: animeItem[]) => expect(val.length).toBe(75))
});

test('single result', () => {
    var expectedResult: animeItem = {
        title: '[Arisaka] Plunderer - 24 VOSTFR [720p]',
        downloadUrl: 'https://nyaa.si/download/1258131.torrent',
        nyaaUrl: 'https://nyaa.si/view/1258131',
        date: new Date("2020 - 06 - 27T14: 48: 43.000Z"),
        seeders: 28,
        leechers: 1,
        grabs: 186,
        infoHash: '1a19e80f1b834cfed37661ab669e2c7e4505bea7',
        category: 'Anime - Non-English-translated',
        categoryId: '1_3',
        remake: false,
        trusted: false,
        size: '310.2 MiB'
    }
    var data = searchNyaa({
        "term": "plunderer 24 vostfr",
        "user": "keeso"
    }).then((val: animeItem[]) => { expect(typeof(val)).toBe(typeof(expectedResult))})
});
test('single advanced result', () => {
    var expectedResult: animeItem = {
        title: '[Arisaka] Plunderer - 24 VOSTFR [720p]',
        downloadUrl: 'https://nyaa.si/download/1258131.torrent',
        nyaaUrl: 'https://nyaa.si/view/1258131',
        date: new Date("2020 - 06 - 27T14: 48: 43.000Z"),
        seeders: 28,
        leechers: 1,
        grabs: 186,
        infoHash: '1a19e80f1b834cfed37661ab669e2c7e4505bea7',
        category: 'Anime - Non-English-translated',
        categoryId: '1_3',
        remake: false,
        trusted: false,
        size: '310.2 MiB'
    }
    var data = searchNyaa({
        "term": "plunderer 24 vostfr",
        "user": "keeso",
        advanced: true
    }).then((val: animeItem[]) => { expect(typeof(val)).toBe(typeof(expectedResult))})
});