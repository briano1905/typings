// Get document element
const pageTheme = document.querySelector('#theme');
const leftWing = document.querySelector('#left-wing');
const rightWing = document.querySelector('#right-wing');
const textDisplay = document.querySelector('#text-display');
const inputField = document.querySelector('#input-field');
const redoButton = document.querySelector('#redo-button');

// Initialize typing mode variables
let typingMode = 'wordcount';
let wordCount;
let timeCount;

// Initialize dynamic variables
let randomWords = [];
let wordList = [];
let currentWord = 0;
let correctKeys = 0;
let startDate = 0;
let timer;
let timerActive = false;

// Get cookies
getCookie('theme') === '' ? setTheme('light') : setTheme(getCookie('theme'));
getCookie('language') === '' ? setLanguage('english') : setLanguage(getCookie('language'));
getCookie('wordCount') === '' ? setWordCount(50) : setWordCount(getCookie('wordCount'));
getCookie('timeCount') === '' ? setTimeCount(60) : setTimeCount(getCookie('timeCount'));
getCookie('typingMode') === '' ? setTypingMode('wordcount') : setTypingMode(getCookie('typingMode'));

// Find a list of words and display it to textDisplay
function setText() {
  // Reset variables
  wordList = [];
  currentWord = 0;
  correctKeys = 0;
  inputField.value = '';
  timerActive = false;
  clearTimeout(timer);
  textDisplay.style.display = 'block';

  switch (typingMode) {
    case 'wordcount':
      textDisplay.style.height = 'auto';
      textDisplay.innerHTML = '';
      wordList = [];
      for (i = 0; i < wordCount; i++) {
        let span = document.createElement('span');
        let n = Math.floor(Math.random() * randomWords.length);
        wordList.push(randomWords[n]);
        span.innerHTML = randomWords[n] + ' ';
        textDisplay.appendChild(span);
      }
      textDisplay.firstChild.classList.add('highlight');
      break;

    case 'time':
      textDisplay.style.height = '3.2rem';
      document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
      textDisplay.innerHTML = '';
      wordList = [];
      for (i = 0; i < 500; i++) {
        let span = document.createElement('span');
        let n = Math.floor(Math.random() * randomWords.length);
        wordList.push(randomWords[n]);
        span.innerHTML = randomWords[n] + ' ';
        textDisplay.appendChild(span);
      }
      textDisplay.firstChild.classList.add('highlight');
  }
  inputField.focus();
}

// Key is pressed in input field
inputField.addEventListener('keydown', e => {
  // If it is the first character entered
  if (currentWord === 0 && inputField.value === '') {
    switch (typingMode) {
      case 'wordcount':
        startDate = Date.now();
        break;

      case 'time':
        if (!timerActive) {
          startTimer(timeCount);
          timerActive = true;
        }
        function startTimer(time) {
          if (time > 0) {
            document.querySelector(`#tc-${timeCount}`).innerHTML = time;
            timer = setTimeout(() => {
              time--;
              startTimer(time);
            }, 1000);
          } else {
            textDisplay.style.display = 'none';
            document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
            showResult();
          }
        }
    }
  }

  // If it is the space key check the word and add correct/incorrect class
  if (e.key === ' ') {
    e.preventDefault();

    // Scroll down text when reach new line
    if (typingMode === 'time') {
      const currentWordPosition = textDisplay.childNodes[currentWord].getBoundingClientRect();
      const nextWordPosition = textDisplay.childNodes[currentWord + 1].getBoundingClientRect();
      if (currentWordPosition.top < nextWordPosition.top) {
        for (i = 0; i < currentWord + 1; i++) textDisplay.childNodes[i].style.display = 'none';
      }
    }

    // If it is not the last word increment currentWord,
    if (currentWord < wordList.length - 1) {
      if (inputField.value === wordList[currentWord]) {
        textDisplay.childNodes[currentWord].classList.add('correct');
        correctKeys += wordList[currentWord].length + 1;
      } else {
        textDisplay.childNodes[currentWord].classList.add('incorrect');
      }
      textDisplay.childNodes[currentWord + 1].classList.add('highlight');
    } else if (currentWord === wordList.length - 1) {
      textDisplay.childNodes[currentWord].classList.add('incorrect');
      showResult();
    }

    inputField.value = '';
    currentWord++;

    // Else if it is the last word and input word is correct show the result
  } else if (currentWord === wordList.length - 1) {
    if (inputField.value + e.key === wordList[currentWord]) {
      textDisplay.childNodes[currentWord].classList.add('correct');
      correctKeys += wordList[currentWord].length;
      currentWord++;
      showResult();
    }
  }
});

// Calculate and display result
function showResult() {
  let words, minute, acc;
  switch (typingMode) {
    case 'wordcount':
      words = correctKeys / 5;
      minute = (Date.now() - startDate) / 1000 / 60;
      let totalKeys = -1;
      wordList.forEach(e => (totalKeys += e.length + 1));
      acc = Math.floor((correctKeys / totalKeys) * 100);
      break;

    case 'time':
      words = correctKeys / 5;
      minute = timeCount / 60;
      let sumKeys = -1;
      for (i = 0; i < currentWord; i++) {
        sumKeys += wordList[i].length + 1;
      }
      acc = acc = Math.min(Math.floor((correctKeys / sumKeys) * 100), 100);
  }
  let wpm = Math.floor(words / minute);
  rightWing.innerHTML = `WPM: ${wpm} / ACC: ${acc}`;
}

// When redo button is click reset text
redoButton.addEventListener('click', e => setText());

// Command actions
document.addEventListener('keydown', e => {
  // Modifiers Windows: [Alt], Mac: [Cmd + Ctrl]
  if (e.altKey || (e.metaKey && e.ctrlKey)) {
    // [mod + t] => Change the theme
    if (e.key === 't') {
      setTheme(inputField.value);
    }
    // [mod + l] => Change the language
    if (e.key === 'l') {
      setLanguage(inputField.value);
    }

    // [mod + m] => Change the typing mode
    if (e.key === 'm') {
      setTypingMode(inputField.value);
    }
  }
});

function setTheme(_theme) {
  const theme = _theme.toLowerCase();
  setCookie('theme', theme, 90);
  pageTheme.setAttribute('href', `themes/${theme}.css`);
  inputField.value = '';
}

function setLanguage(_lang) {
  const lang = _lang.toLowerCase();
  setCookie('language', lang, 90);
  fetch('texts/random.json')
    .then(response => response.json())
    .then(json => {
      textDisplay.innerHTML = '';
      randomWords = json[lang];
      setText();
    })
    .catch(err => console.error(err));
}

function setTypingMode(_mode) {
  const mode = _mode.toLowerCase();
  switch (mode) {
    case 'wordcount':
      typingMode = mode;
      setCookie('typingMode', mode, 90);
      document.querySelector('#word-count').style.display = 'inline';
      document.querySelector('#time-count').style.display = 'none';
      break;

    case 'time':
      typingMode = mode;
      setCookie('typingMode', mode, 90);
      document.querySelector('#word-count').style.display = 'none';
      document.querySelector('#time-count').style.display = 'inline';
  }
  setText();
}

function setWordCount(wc) {
  setCookie('wordCount', wc, 90);
  wordCount = wc;
  document.querySelectorAll('#word-count > span').forEach(e => (e.style.borderBottom = ''));
  document.querySelector(`#wc-${wordCount}`).style.borderBottom = '2px solid';
  setText();
}

function setTimeCount(tc) {
  setCookie('timeCount', tc, 90);
  timeCount = tc;
  document.querySelectorAll('#time-count > span').forEach(e => {
    e.style.borderBottom = '';
    e.innerHTML = e.id.substring(3, 6);
  });
  document.querySelector(`#tc-${timeCount}`).style.borderBottom = '2px solid';
  setText();
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
