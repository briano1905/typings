// Get document element
const pageTheme = document.querySelector('#theme');
const leftWing = document.querySelector('#left-wing');
const rightWing = document.querySelector('#right-wing');
const textDisplay = document.querySelector('#text-display');
const inputField = document.querySelector('#input-field');
const redoButton = document.querySelector('#redo-button');

// Initialize variables
let theme = 'light';
let textType = 'random';
let randomWords = [];
let wordCount = 10;

// Initialize dynamic variables
let wordList = [];
let currentWord = 0;
let correctKeys = 0;
let startDate = 0;

// Get cookies
getCookie('theme') === '' ? setTheme('light') : setTheme(getCookie('theme'));
getCookie('language') === '' ? setLanguage('english') : setLanguage(getCookie('language'));
getCookie('wordCount') === '' ? setWordCount(50) : setWordCount(getCookie('wordCount'));

// Find a list of words and display it to textDisplay
function setText() {
  // Reset variables
  wordList = [];
  currentWord = 0;
  correctKeys = 0;
  inputField.value = '';

  switch (textType) {
    case 'random':
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
  }
  inputField.focus();
}

// Key is pressed in input field
inputField.addEventListener('keydown', e => {
  // Start date if its the first word and inputField is empty
  if (currentWord === 0 && inputField.value === '') startDate = Date.now();

  // If it is the space key check the word and add correct/incorrect class
  if (e.key === ' ') {
    e.preventDefault();
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
  let words = correctKeys / 5;
  let minute = (Date.now() - startDate) / 1000 / 60;
  let wpm = Math.floor(words / minute);

  let totalKeys = 0;
  wordList.forEach(e => (totalKeys += e.length + 1));
  totalKeys--;
  let acc = Math.floor((correctKeys / totalKeys) * 100);

  rightWing.innerHTML = `WPM: ${wpm} / ACC: ${acc}`;
}

// When redo button is click reset text
redoButton.addEventListener('click', e => setText());

// Setup word count changer
leftWing.childNodes.forEach(e => {
  if (e.localName === 'span') {
    e.onclick = event => setWordCount(e.innerHTML);
  }
});

// Command actions
document.addEventListener('keydown', e => {
  // Modifiers Windows: [Alt], Mac: [Cmd + Ctrl]
  if (e.altKey || (e.metaKey && e.ctrlKey)) {
    // [ + t] => Change the theme
    if (e.key === 't') {
      setTheme(inputField.value);
    }
    // [ + l] => Change the language
    if (e.key === 'l') {
      setLanguage(inputField.value.trim());
    }
  }
});

function setTheme(theme) {
  setCookie('theme', theme, 90);
  pageTheme.setAttribute('href', `themes/${theme}.css`);
}

function setLanguage(lang) {
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

function setWordCount(wc) {
  setCookie('wordCount', wc, 90);
  wordCount = wc;
  document.querySelectorAll('.word-count-preset').forEach(e => (e.style.borderBottom = ''));
  document.querySelector(`#word-count-${wordCount}`).style.borderBottom = '2px solid';
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
