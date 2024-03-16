const button = document.getElementById("roll-btn");
const diceContainer = document.getElementById("dice-container");
const diceElements = Array.from(diceContainer.children);

function toggleLock(index) {
  dice[index].locked = !dice[index].locked;
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
        break;
      case 2:
        fullHouse = 0;
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
    isConsecutive(orderedScores.slice(0, 4)) ||
    isConsecutive(orderedScores.slice(1, 5));
  largeStraight = isConsecutive(orderedScores);

  console.log(threeOAK, fourOAK, fullHouse, yahtzee);
}

function roll() {
  const scores = [];
  dice.forEach((die) => {
    const value = Math.ceil(Math.random() * 6);
    die.value = value;
    die.element.innerText = value;
    scores.push(value);
  });
  checkScores(scores);
}

diceElements.forEach((die, index) =>
  die.addEventListener("click", () => toggleLock(index))
);

let dice = diceElements.map((die, index) => ({
  element: die,
  value: index + 1,
  locked: false,
}));

button.addEventListener("click", roll);
