const button = document.getElementById("roll-btn");
const scoreCard = document.getElementById("score-card");
const scoreRows = scoreCard.children[0].children;
let cells = [];

function disposeUnselected(unselected) {}
function handleSelect(e) {
  if (!player) return;
  const target = cells.find((cell) => {
    if (cell === e.target) {
      return cell;
    }
  });

  if (!target.innerText) {
    target.innerText = 0;
    clearPreviews(previewValues);
    previewValues = [];
    return;
  } else if (!previewValues.includes(target)) {
    return;
  } else {
    const unselected = previewValues.filter((cell) => {
      if (cell !== target) {
        return cell;
      }
    });
    clearPreviews(unselected);
  }
  previewValues = [];
}
for (let i = 0; i < 17; i++) {
  if (i === 0 || i === 7 || i === 8 || i === 16) {
    continue;
  }
  const cell = scoreRows[i].children[1];
  cell.addEventListener("click", (e) => handleSelect(e));
  cells.push(cell);
}
const diceContainer = document.getElementById("dice-container");
const diceElements = Array.from(diceContainer.children);
let player = true;

function toggleTurn() {
  player = !player;
}

function toggleLock(index) {
  dice[index].locked = !dice[index].locked;
}

function handleToggleLock(index) {
  if (!player) return;
  toggleLock(index);
}

function isConsecutive(scores) {
  if (
    scores.every((value, index) => value === index + 1) ||
    scores.every((value, index) => value === index + 2)
  ) {
    return true;
  }
  return false;
}

function sum(scores) {
  return scores.reduce((a, b) => a + b, 0);
}

let previewValues = [];
function clearPreviews(previewValues) {
  console.log(previewValues);
  for (const value of previewValues) {
    value.innerText = "";
  }
  previewValues = [];
}

function toggleClickable() {
  console.log("done");
}

function showAvailableMoves(scores) {
  clearPreviews(scores);
  console.log(scoreRows);
  let i = 1;
  let col = player ? 1 : 2;
  for (const score of scores) {
    if (!scoreRows[i].cells[col].innerText && score > 0) {
      previewValues.push(scoreRows[i].cells[col]);
      scoreRows[i].cells[col].innerText = score;
    }
    i++;
  }
}

function checkScores(scores) {
  const total = sum(scores);
  let upperScores = [];
  for (let i = 1; i <= 6; i++) {
    const score = scores.reduce((a, b) => {
      if (b == i) {
        return a + b;
      } else {
        return a;
      }
    }, 0);
    upperScores.push(score);
  }

  const uniqueValues = [...new Set(scores)];
  let yahtzee = 0;
  let fullHouse = 0;
  let fourOAK = 0;
  let threeOAK = 0;

  //fullhouse, 4 of a kind, yahtzee
  if (uniqueValues.length === 1) {
    yahtzee = true;
  } else if (uniqueValues.length === 2) {
    const test = uniqueValues[0];
    const duplicates = scores.reduce((a, b) => {
      if (b == test) {
        return a + 1;
      } else {
        return a;
      }
    }, 0);

    switch (duplicates) {
      case 4:
        fourOAK = sum(scores);
        break;
      case 3:
        threeOAK = sum(scores);
        fullHouse = 25;
        break;
      case 2:
        fullHouse = 25;
        threeOAK = uniqueValues[1] * 3;
        break;
      case 1:
        fourOAK = sum(scores);
        break;
    }
  } else if (uniqueValues.length === 3) {
    let i = 0;
    let hasThree = false;
    while (!hasThree && i < 3) {
      const test = uniqueValues[i];
      const duplicates = scores.reduce((a, b) => {
        if (b == test) {
          return a + 1;
        } else {
          return a;
        }
      }, 0);
      if (duplicates === 3) {
        threeOAK = sum(scores);
        hasThree = true;
      }
      i++;
    }
  }
  const orderedScores = uniqueValues.sort();

  smallStraight =
    isConsecutive(scores.sort().slice(0, 4)) ||
    isConsecutive(scores.sort().slice(1, 5))
      ? 30
      : 0;
  largeStraight = isConsecutive(scores.sort()) ? 40 : 0;
  const allScores = [
    ...upperScores,
    0,
    0,
    threeOAK,
    fourOAK,
    fullHouse,
    smallStraight,
    largeStraight,
    total,
    yahtzee,
  ];
  console.log(allScores);
  showAvailableMoves(allScores);
}

function handleRoll() {
  if (!player) return;
  roll();
}

function roll() {
  const scores = [];
  dice.forEach((die) => {
    if (die.locked) {
      die.locked = false;
      return;
    }
    const value = Math.ceil(Math.random() * 6);
    die.value = value;
    die.element.innerText = value;
    scores.push(value);
  });
  checkScores(scores);
}

diceElements.forEach((die, index) =>
  die.addEventListener("click", () => handleToggleLock(index))
);

let dice = diceElements.map((die, index) => ({
  element: die,
  value: index + 1,
  locked: false,
}));

button.addEventListener("click", handleRoll);
