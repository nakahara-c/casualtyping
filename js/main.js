/*** 
 * Copyright (c) 2021 Whitefox
 * This code is part of RomanTypeParser and is released under the MIT License.
 * https://github.com/WhiteFox-Lugh/RomanTypeParser/blob/main/LICENSE
***/


'use strict';

//import { Word } from 'higgsino';
// This function is based on code from RomanTypeParser by Whitefox (MIT License)
import { parser } from './parser.js';

/*
let testWord = new Word('漢字', 'いっちょうめ');

const viewConsole = () => {
    // Example
    console.log("例文を取得", testWord.example);

    // Kana
    console.log("よみがなの全てを取得", testWord.kana.all);
    console.log("よみがなの打った部分を取得", testWord.kana.typed);
    console.log("よみがなの打ってない部分を取得", testWord.kana.untyped);

    // Roman
    console.log("ローマ字の全文字を取得", testWord.roman.all);
    console.log("ローマ字の打った文字を取得", testWord.roman.typed);
    console.log("ローマ字の打ってない文字を取得", testWord.roman.untyped);

    console.log("ローマ字の全配列を取得", testWord.roman.array.all);
    console.log("ローマ字の打った配列を取得", testWord.roman.array.typed);
    console.log("ローマ字の打ってない配列を取得", testWord.roman.array.typed);
}

viewConsole();

testWord.typed('i');

viewConsole();

testWord.typed('x');

viewConsole();

testWord.typed('t');
testWord.typed('u');
testWord.typed('c');

viewConsole();
*/


let wordHiraganaArea = document.getElementById('word');
let wordRomanArea = document.getElementById('wordRoman');
let word = '';
const OKButton = document.getElementById('OK');
const STOPButton = document.getElementById('STOP');

let startTime;
let intervalId;


const timer = document.getElementById('timer');
const count = document.getElementById('count');
const kpm = document.getElementById('kpm');

let wordMem = '';

let timerArray = [];
let typeText;

let timeLabel = [];
let kpmArray = [];
let chart = null;

let roman = '';
let tmpNum = 0;

let isPlaying = false;


wordHiraganaArea.addEventListener('input', () => {
    parseWord();
});

async function parseWordOld() {
    await (async () => typeText = await parser(wordHiraganaArea.value))();
    roman = typeText.judgeAutomaton.map(elem => elem[0]).join('');
    wordRomanArea.value = roman;
}

function parseWord () {
    word = new Word('', wordHiraganaArea.value);
    console.log(word);
    wordRomanArea.value = word.roman.all;
}

parseWord();

OKButton.addEventListener('click', () => {
    window.addEventListener('keydown', judgeKeys, false);
    wordHiraganaArea.disabled = true;
    OKButton.disabled = true;
    STOPButton.disabled = false;
    wordRomanArea.disabled = true;
    wordMem = wordHiraganaArea.value;
    timeLabel = [];
    kpmArray = [];
});

STOPButton.addEventListener('click', () => {
    window.removeEventListener('keydown', judgeKeys, false);
    isPlaying = false;
    wordHiraganaArea.disabled = false;
    OKButton.disabled = false;
    STOPButton.disabled = true;
    wordRomanArea.disabled = false;
    clearInterval(intervalId);
    wordHiraganaArea.value = wordMem;
    parseWord();

});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        STOPButton.click();
    }
    if (e.key === 'Enter' || e.key === ' ') {
        OKButton.click();
    }
}, false);




function firstKeyPressed() {
    timer.textContent = "0.0";
    count.textContent = "0";
    kpm.textContent = "0";

    startTime = performance.now();
    intervalId = setInterval(startTimer, 1);

    tmpNum = typeText.judgeAutomaton[0].length;
}

function startTimer() {

    let currentTime = (performance.now() - startTime) / 1000;
    currentTime = currentTime.toFixed(1);
    timer.textContent = currentTime;
    if (currentTime > 0.2) {
        kpmArray.push(Number(kpm.textContent));
        timeLabel.push(currentTime);
    }
}

function judgeKeys(e) {
    let typedKey = e.key;

    const [isMiss, isFinish] = word.typed(typedKey);
    if (isFinish) typeFinish(true);
    if (isMiss);

    console.log(word.kana.typed);

    //ひらがなの方に反映
    wordHiraganaArea.value = word.kana.untyped;

    //ローマ字の方に反映
    wordRomanArea.value = word.roman.untyped;

}



function judgeKeysOld(e) {

    //e.preventDefault();
    let typedKey = e.key;

    //judgeAutomaton受け取ってそれに応じて判定していく
    /*
    japaneseWord.parsedSentence -> ['た'], ['ぷ'],...
    japaneseWord.judgeAutomaton -> ['ta'], ['pu'],...
    */

    let currentHiraganaLength = typeText.parsedSentence[0].length;
    let currentRoman = typeText.judgeAutomaton[0];

    let isOK = false;
    let isLast = false;

    for (let i = 0; i < currentRoman.length; i++) {
        if (typedKey === currentRoman[i][0]) {
            isOK = true;

            if (currentRoman[i].length === 1) {
                isLast = true;
            } else {
                currentRoman[i] = currentRoman[i].slice(1);
            }
        }
    }

    if (isOK) {
        if (!isPlaying) {
            isPlaying = true;
            firstKeyPressed();
        }

        //console.log(tmpNum);
        tmpNum -= 1;
        if (tmpNum >= 0) wordRomanArea.value = wordRomanArea.value.slice(1);

        if (isLast) {
            typeText.parsedSentence.shift();
            typeText.judgeAutomaton.shift();
            wordHiraganaArea.value = wordHiraganaArea.value.slice(currentHiraganaLength);
            if (typeText.judgeAutomaton[0]) {
                tmpNum = typeText.judgeAutomaton[0][0].length;
            }
            
        }

        count.textContent = String(Number(count.textContent) + 1);
        let kpmValue = Math.round(Number(count.textContent) / Number(timer.textContent) * 60);
        if (kpmValue === Infinity) kpmValue = 0;
        kpm.textContent = String(kpmValue);

    }
    if (wordRomanArea.value === '' || !typeText.judgeAutomaton[0]) {
        typeFinish(true);
    }

}


function typeFinish(isCompleted) {
    clearInterval(intervalId);
    isPlaying = false;
    window.removeEventListener('keydown', judgeKeys, false);
    drawChart();

}

function initializeDataBox () {
    timer.textContent = '0.000';
    count.textContent = '0';
    kpm.textContent = '0';
    return;
}


function drawChart() {

    const ctx = document.getElementById('chart').getContext('2d');

    const chartData = kpmArray;

    if (chart) chart.destroy();
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabel,
            datasets: [{
                label: 'KPM',
                data: chartData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointStyle: 'none',
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: 'rgba(255, 99, 132, 1)',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {}
            },
            plugins: {
                tooltip: {
                    titleColor: 'rgba(0, 0, 0, 1)',
                    bodyColor: 'rgba(0, 0, 0, 1)',

                    backgroundColor: 'rgba(248, 236, 243, 1)',

                    displayColors: false,

                }
            }
        }
    });

}