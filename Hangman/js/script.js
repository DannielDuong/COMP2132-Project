// G;obal variables

const words = {
  animal: ['BUFFALO', 'PENGUIN', 'ELEPHANT', 'ALLIGATOR', 'MONKEYS', 'TORTOISE', 'FISH', 'BADGER', 'BEETLE', 'TIGER', 'RHINOCEROS'],
  tool: ['HAMMER', 'WRENCH', 'KNIFE', 'RATCHET', 'IMPACT GUN', 'MULTIMETER', 'SCREWDRIVER'],
  countries: ['ARGENTINA', 'AZERBAIJAN', 'CAMBODIA', 'DENMARK', 'LUXEMBOURG', 'SWITZERLAND', 'UGANDA', 'VIETNAM', 'PARAGUAY', 'NETHERLANDS', 'MEXICO'],
  movies: ['GODFATHER', 'PULP FICTION', 'FIGHT CLUB', 'INCEPTION', 'INTERSTELLAR', 'BACK TO THE FUTURE', 'GLADIATOR', 'LEON', 'WHIPLASH', 'WALL E', 'GOOD WILL HUNTING']
}

let game = {
  $popUp: $('#popup'),
  $main: $('#main'),
  $wordDisplay: $('#word-display'),
  $result: $('#result'),
  $hint: $('#hint'),
  $newGameOption: $('#option'),
  gameOn: true,
  $allButtons: $('.input-btn'),
  htmlContent: null 
};

//--------------------------

// main function to run program

main();

//----------------

// Mutiple functions to run in main(). 

async function main() {
  let userInput;
  let gameCondition = false;
  const allowTries = 10;
  let userTries = 0;
  let victory = false;

  // initiate pop up

  displayPopUp();

  // Wait for the user to select a topic
  const topic = await getTopicFromUser();
  // Proceed with getting a random word
  const randomWord = getRandomWord(topic);
  

  // Create placeholders _ for random word
  game.htmlContent = addWordToWordDisplay(randomWord);
  const originalContent = randomWord;
  game.$wordDisplay.html(game.htmlContent);

  // create Hint 
  createHint(randomWord);

  // attach event listener to new-game and exit to reset game or exit 
  game.$newGameOption.on('click', resetGame);

  // gameController
  while (!gameCondition) {
    userInput = await getInputFromUser();
    let [condition, indexList] = checkInputInWord(userInput, randomWord);
    let htmlContentArray = game.htmlContent.split('');
    if (condition) {
      for (let i of indexList) {
        htmlContentArray[i] = userInput;
      }
    } else {
      userTries++;
      displayHangManImage(userTries);
      if (userTries == allowTries) {
        displayResult(victory);
        game.$wordDisplay.html(originalContent);
        game.gameOn = false;
        return;
      }
    }
    game.htmlContent = htmlContentArray.join('');
    game.$wordDisplay.html(game.htmlContent);
    if (game.htmlContent.indexOf('_') == -1) {
      // display result pop up for result.
      victory = true;
      displayResult(victory);
      gameCondition = true;
      game.gameOn = false;
    }
  }
}

async function getTopicFromUser() {
  return new Promise(resolve => {
    const $topicGroup = $('#topic-group');
    $topicGroup.on('click', function (e) {
     if(e.target.value !== undefined) {
      const topic = e.target.value;
      hidePopUp();
      resolve(topic);
     }
    });
  });
}

async function getInputFromUser() {
  return new Promise(resolve => {
    const $inputs = $('#inputs');
    $inputs.on('click', function (e) {
      if (e.target.value !== undefined) {
        const input = e.target.value;
        // disable button after being clicked 
        const inputKey = e.target;
        $(inputKey).prop('disabled', true);
        resolve(input);
      }
    })
  });
}

function displayHangManImage(userTryTimes) {
  const $hangManImage = $('#hangman-image');
  const hangManImagePath = `../images/${userTryTimes}.jpg`;
  $hangManImage.attr('src', `${hangManImagePath}`);
}

function addWordToWordDisplay(randomWord) {
  let htmlContent = '';
  for (i = 0; i < randomWord.length; i++) {
    if (randomWord[i] !== ' ') {
      htmlContent += '_';
    } else {
      htmlContent += ' ';
    }
  }
  return htmlContent;
}

function checkInputInWord(userInput, randomWord) {
  const indexList = [];
  let condition = false;
  for (let i = 0; i < randomWord.length; i++) {
    if (userInput === randomWord[i]) {
      indexList.push(i);
      condition = true;
    }
  }
  return [condition, indexList];
}

function getRandomWord(key) {
  const topicArray = words[key];
  const randomIndex = getRandomInt(0, topicArray.length);
  const randomWord = topicArray[randomIndex];
  return randomWord
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomIndexAndChar(min, max, randomWord) {
  const randomIndex = Math.floor(Math.random() * (max - min)) + min;
  const randomChar = randomWord.charAt(randomIndex);
  return [randomIndex, randomChar];
}

function createHint(randomWord) {
  let hintCount = 0;
  const maxHints = 3;
  const usedIndices = [];

  function handleHintClick() {
    if (game.gameOn) {
      console.log(hintCount);
      if (hintCount !== maxHints) {
        let randomIndex, randomChar;

        // Loop and push to usedIndices to get a unique hint each time users click hint.
        do {
          [randomIndex, randomChar] = getRandomIndexAndChar(0, randomWord.length, randomWord);
        } while (usedIndices.includes(randomIndex));

        usedIndices.push(randomIndex);

        let htmlContentArray = game.htmlContent.split('');

        // Replace occurrences of the randomChar in the word
        let [condition, indexList] = checkInputInWord(randomChar, randomWord);
        if (condition) {
          for (let i of indexList) {
            htmlContentArray[i] = randomChar;
          }
          game.htmlContent = htmlContentArray.join('');
          game.$wordDisplay.html(game.htmlContent);
        }

        hintCount++;

        // Disable input key if a hint is shown
        $(`[value="${randomChar}"]`).prop('disabled', true);
      }
      // Another if to disable the hint right after 3 attempt clicks
      if (hintCount === maxHints) {
        game.$hint.css('fill', 'grey');
        game.$hint.off('click', handleHintClick); // Unbind the click event after maxHints is reached
      }
    }
  }

  // Unbind existing click events before attaching a new one
  game.$hint.off('click', handleHintClick);

  // Attach the event listener to the hint button
  game.$hint.on('click', handleHintClick);
}


function displayPopUp() {
  game.$popUp.fadeTo(1000, 1);
  game.$popUp.css('z-index', '0');
  // disable all buttons until pop-up is gone
  disableAllButtons();
}

function hidePopUp() {
  game.$popUp.fadeTo(500, 0);
  game.$popUp.css('z-index', '-2');
  // unblur main content after selecting topic.
  game.$main.css('filter', 'blur(0px)');
  enableAllButtons();
}

function displayResult(victory) {
  // Display won or lost depends on game result. 
  if(victory) {
    $('#result-statement').html('Bingo!');
  } else {
    $('#result-statement').html('You have lost');
  }
  game.$result.fadeTo(1000,3);
  game.$result.css('z-index', 0);
  game.$main.css('filter', 'blur(10px)');
  disableAllButtons();
}

function hideResult() {
  game.$result.fadeTo(500, 0);
  game.$result.css('z-index', '-2');
  // blur main content after reseting game. 
  game.$main.css('filter', 'blur(10px)')
}
function resetHint() {
  game.$hint.css('fill', 'black');
}

function resetBtn() {
  const $btn = $('button');
  $btn.prop('disabled', false);
}
function resetAll() {
  game.gameOn = true;
  resetHint();
  resetBtn();
}

function resetGame(e) {
  const input = e.target.value;
  if(input !== undefined) {
    if(input === 'new') {
        hideResult();
        displayPopUp();
        resetAll();
        main();
    } else {
    }
  }
}

function enableAllButtons() {
  game.$allButtons.prop('disabled', false);
}
function disableAllButtons() {
   game.$allButtons.prop('disabled', true)
}

function resetHangManImage() {
  const $hangManImage = $('#hangman-image');
  const hangManImagePath = `../images/0.jpg`;
  $hangManImage.attr('src', `${hangManImagePath}`);
}