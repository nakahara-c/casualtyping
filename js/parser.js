//にほんごろーまじにする

export async function parser(word) {
    const mappingDict = await loadMappingDict();
    let dict = new Object();
    for (let i = 0; i < mappingDict.length; i++) {
        let p = mappingDict[i].Pattern;
        let t = mappingDict[i].TypePattern;
        dict[p] = t;
    }

    const hiraToKana = text => {
        return text.replace(/[\u30A2-\u30F3]/g,
            m => String.fromCharCode(m.charCodeAt(0) - 96)
        );
    };
    
    let hiragana = hiraToKana(word);
    let res = constructTypeSentence(dict, hiragana);

    return res;

}

async function loadMappingDict() {
    try {
        const response = await fetch('./js/romanTypingParseDictionary.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const mappingDict = await response.json();
        return mappingDict;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function constructTypeSentence(mappingDict, sentenceHiragana) {
    let idx = 0;
    let uni, bi, tri;
    let judge = [];
    let parsedStr = [];
    while (idx < sentenceHiragana.length) {
        let validTypeList;
        uni = sentenceHiragana[idx].toString();
        bi = (idx + 1 < sentenceHiragana.length) ? sentenceHiragana.substring(idx, idx + 2) : "";
        tri = (idx + 2 < sentenceHiragana.length) ? sentenceHiragana.substring(idx, idx + 3) : "";

        if (mappingDict.hasOwnProperty(tri)) {
            validTypeList = mappingDict[tri].slice();
            idx += 3;
            parsedStr.push(tri);
        }
        else if (mappingDict.hasOwnProperty(bi)) {
            validTypeList = mappingDict[bi].slice();
            idx += 2;
            parsedStr.push(bi);
        }
        else {
            validTypeList = mappingDict[uni].slice();
            idx += 1;
            parsedStr.push(uni);
        }
        judge.push(validTypeList);
    }

    return { parsedSentence: parsedStr, judgeAutomaton: judge };
}