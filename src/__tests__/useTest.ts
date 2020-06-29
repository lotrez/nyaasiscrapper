import { searchNyaa, searchOptions, animeItem } from "../index"

test('empty arg test', () => {
    expect(() => searchNyaa()).not.toThrow()
});
