import { searchNyaa, searchOptions, animeItem, file } from "../index"

describe("file tests", () => {
    
    test('Files parser test: singular file', () => {
        let opts: searchOptions = {
            term: "Koitaku",
            category: "6_2",
            advanced: true
        }
        let resultExpected: file[] = [{ title: 'Koitaku.rar ', size: '(32.5 GiB)', parentDir: '/' }]
        searchNyaa(opts).then((results) => { expect(results[0].files).toStrictEqual(resultExpected)})
    });
    
    test('Files parser test: season type structure', () => {
        let opts: searchOptions = {
            term: "[Cleo] Kaguya-sama wa Kokurasetai?: Tensai-tachi no Renai Zunousen | Kaguya-sama: Love is War Season 2 | Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2 [10bit 1080p][HEVC-x265]",
            advanced: true,
        }
        let resultExpected: file[] = [
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_01_(10bit_1080p_x265).mkv ',
                size: '(528.3 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_02_(10bit_1080p_x265).mkv ',
                size: '(404.0 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_03_(10bit_1080p_x265).mkv ',
                size: '(275.2 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_04_(10bit_1080p_x265).mkv ',
                size: '(382.4 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_05_(10bit_1080p_x265).mkv ',
                size: '(370.2 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_06_(10bit_1080p_x265).mkv ',
                size: '(232.9 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_07_(10bit_1080p_x265).mkv ',
                size: '(471.0 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_08_(10bit_1080p_x265).mkv ',
                size: '(393.4 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_09_(10bit_1080p_x265).mkv ',
                size: '(375.0 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_10_(10bit_1080p_x265).mkv ',
                size: '(432.0 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_11_(10bit_1080p_x265).mkv ',
                size: '(401.9 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            },
            {
                title: '[Cleo]Kaguya-sama_wa_Kokurasetai_Tensai-tachi_no_Renai_Zunousen_S2_-_12_(10bit_1080p_x265).mkv ',
                size: '(369.7 MiB)',
                parentDir: '/Kaguya-sama wa Kokurasetai Tensai-tachi no Renai Zunousen S2'
            }
        ]
        searchNyaa(opts).then((results) => { expect(results[0].files).toStrictEqual(resultExpected)})
    });

})