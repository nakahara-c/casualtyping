/*** 
 * Copyright (c) 2021 Whitefox
 * This code is part of RomanTypeParser and is released under the MIT License.
 * https://github.com/WhiteFox-Lugh/RomanTypeParser/blob/main/LICENSE
***/


'use strict';

// This function is based on code from RomanTypeParser by Whitefox (MIT License)
import { parser } from './parser.js';

let word = document.getElementById('word');
let wordRoman = document.getElementById('wordRoman');
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


word.addEventListener('input', () => {
    parseWord();
});

async function parseWord() {
    await (async () => typeText = await parser(word.value))();
    roman = typeText.judgeAutomaton.map(elem => elem[0]).join('');
    wordRoman.value = roman;
}

parseWord();

OKButton.addEventListener('click', () => {
    window.addEventListener('keydown', judgeKeys, false);
    word.disabled = true;
    OKButton.disabled = true;
    STOPButton.disabled = false;
    wordRoman.disabled = true;
    wordMem = word.value;
    timeLabel = [];
    kpmArray = [];
});

STOPButton.addEventListener('click', () => {
    window.removeEventListener('keydown', judgeKeys, false);
    isPlaying = false;
    word.disabled = false;
    OKButton.disabled = false;
    STOPButton.disabled = true;
    wordRoman.disabled = false;
    clearInterval(intervalId);
    word.value = wordMem;
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
    intervalId = setInterval(startTimer, 100);

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
        if (tmpNum >= 0) wordRoman.value = wordRoman.value.slice(1);

        if (isLast) {
            typeText.parsedSentence.shift();
            typeText.judgeAutomaton.shift();
            word.value = word.value.slice(currentHiraganaLength);
            if (typeText.judgeAutomaton[0]) {
                tmpNum = typeText.judgeAutomaton[0][0].length;
            }
            
        }

        count.textContent = String(Number(count.textContent) + 1);
        let kpmValue = Math.round(Number(count.textContent) / Number(timer.textContent) * 60);
        if (kpmValue === Infinity) kpmValue = 0;
        kpm.textContent = String(kpmValue);

    }
    if (wordRoman.value === '' || !typeText.judgeAutomaton[0]) {
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