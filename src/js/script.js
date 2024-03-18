import { RootRef } from "@material-ui/core";

const button = document.getElementById("roll-btn");
const scoreCard = document.getElementById("score-card");
const scoreRows = scoreCard.children[0].children;
const counterDisplay = document.getElementById("roll-counter");
const diceContainer = document.getElementById("dice-container");
const diceElements = Array.from(diceContainer.children);
let dice = diceElements.map((die, index) => ({
  element: die,
  value: index + 1,
  locked: false,
}));
let player = true;
let scores = { player: 0, cpu: 0 };
let cells = [];
let rolls = 3;
let previewValues = [];

function handleSelect(selection) {
  if (!player) return;
  const target = cells.find((cell) => {
    if (cell === selection) {
      return cell;
    }
  });

  if (!target.innerText) {
    target.innerText = 0;
  } else if (!previewValues.includes(target)) {
    return;
  } else {
    previewValues = previewValues.filter((cell) => {
      if (cell !== target) {
        return cell;
      }
    });

    scores["player"] += parseInt(target.innerText);
  }
  clearPreviews(previewValues);
  previewValues = [];
  player = !player;
  rolls = 3;
  counterDisplay.innerText = `Rolls remaining: ${rolls}`;
  if (rolls === 3 && !player) {
    cpuTurn();
  }
}
for (let i = 0; i < 17; i++) {
  if (i === 0 || i === 7 || i === 8 || i === 16) {
    continue;
  }
  const cell = scoreRows[i].children[1];
  cell.addEventListener("click", (e) => handleSelect(e.target));
  cells.push(cell);
}

function toggleLock(index) {
  dice[index].locked = !dice[index].locked;
}

function handleToggleLock(index) {
  if (!player) return;
  toggleLock(index);
}

function isConsecutive(scores, length) {
  if (scores.length < length) {
    return false;
  }
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

function clearPreviews(scores) {
  for (const value of scores) {
    value.innerText = "";
  }
  previewValues = [];
}

function showAvailableMoves(scores) {
  clearPreviews(scores);
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

function getUniqueScores(scores) {
  return [...new Set(scores)];
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

  const uniqueValues = getUniqueScores(scores);
  let yahtzee = 0;
  let fullHouse = 0;
  let fourOAK = 0;
  let threeOAK = 0;
  //fullhouse, 4 of a kind, yahtzee
  if (uniqueValues.length === 1) {
    yahtzee = 50;
    threeOAK = 30;
    fourOAK = 40;
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
        threeOAK = sum(scores);
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
        threeOAK = sum(scores);
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

  smallStraight =
    isConsecutive(uniqueValues.sort().slice(0, 4), 4) ||
    isConsecutive(uniqueValues.sort().slice(1, 5), 4)
      ? 30
      : 0;
  largeStraight = isConsecutive(uniqueValues.sort(), 5) ? 40 : 0;
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
  showAvailableMoves(allScores);
  if (!player) {
    return allScores;
  }
}

function handleRoll() {
  if (!player) return;
  roll();
}

export function roll() {
  if (rolls === 0) {
    return;
  }
  clearPreviews(previewValues);
  rolls--;
  counterDisplay.innerText = `Rolls remaining: ${rolls}`;
  const scores = [];
  dice.forEach((die) => {
    if (die.locked) {
      scores.push(die.value);
      return;
    }
    const value = Math.ceil(Math.random() * 6);
    die.value = value;
    die.element.innerText = value;
    scores.push(value);
  });
  checkScores(scores);
  if (!player) {
    return scores;
  }
}

diceElements.forEach((die, index) =>
  die.addEventListener("click", () => handleToggleLock(index))
);

button.addEventListener("click", handleRoll);

//[subject, maximum value]
const scoreRules = {
  ones: [1, 5],
  twos: [2, 10],
  threes: [3, 15],
  fours: [4, 20],
  fives: [5, 25],
  sixes: [6, 30],
  threeOAK: [0, 0],
  fourOAK: [0, 0],
  full: [0, 25],
  small: [0, 30],
  large: [0, 40],
  chance: [6, 30],
  yahtzee: [0, 50],
};

function factorialize(num) {
  if (num < 0) return -1;
  else if (num == 0) return 1;
  else {
    return num * factorialize(num - 1);
  }
}
function howMany(subject, rollResult) {
  const n = rollResult.reduce((a, b) => {
    if (b == subject) {
      return a + 1;
    } else {
      return a;
    }
  }, 0);
  return n;
}

function findSequences(diceRolls, length) {
  // Sort the dice rolls
  diceRolls.sort((a, b) => a - b);

  let minMissing = Infinity;
  let resultSequence = [];

  // Find the minimum and maximum values in diceRolls
  const minDiceRoll = diceRolls[0];
  const maxDiceRoll = diceRolls[diceRolls.length - 1];

  // Generate sequences starting from each value in the range of diceRolls
  for (let i = minDiceRoll; i <= maxDiceRoll - length + 1; i++) {
    let sequence = [];
    let current = i;

    // Generate a sequence starting from the current value
    for (let j = 0; j < length; j++) {
      sequence.push(current++);
    }

    // Calculate the missing values in the sequence
    let missing = countMissing(sequence);

    // Update result if the current sequence has fewer missing values
    if (missing < minMissing) {
      minMissing = missing;
      resultSequence = sequence.slice(); // Make a copy of the sequence
    }
  }

  console.log(resultSequence);
}

function countMissing(sequence) {
  let missingCount = 0;
  for (let i = 0; i < sequence.length - 1; i++) {
    if (sequence[i + 1] - sequence[i] > 1) {
      missingCount += sequence[i + 1] - sequence[i] - 1;
    }
  }
  return missingCount;
}

function firstExpectation(entry, rollResult) {
  let subject = 0;
  let x;
  let i;
  let j;
  let dice = 5;
  let uniqueScores = getUniqueScores(rollResult);
  let p = 0;
  switchCase: switch (entry.key) {
    case "threeOAK":
    case "fourOAK":
    case "yahtzee":
      let max = 0;
      let maxn = 0;
      const multiplier =
        entry.key === "threeOAK" ? 3 : entry.key === "fourOAK" ? 4 : 5;
      const sixes = howMany(6, rollResult);
      for (const score of uniqueScores) {
        const n = howMany(score, rollResult);

        //if achieved
        if (n === multiplier) {
          if (multiplier == 5) {
            return {
              key: entry.key,
              value: 50,
              subject: 0,
            };
          }
          return {
            key: entry.key,
            value: sum(rollResult),
            subject: 0,
          };
        }

        //if not achieved
        if (score * n > max) {
          max = score * n;
          maxn = n;
        }
      }
      subject = max / maxn;
      dice = 5 - maxn;
      x = multiplier == 5 ? 50 : subject * multiplier + (5 - multiplier) * 3.5;
      i = maxn;
      j = multiplier - maxn;
      p = (1 / 6) ** j;
      break;
    case "full":
      console.log("unique", uniqueScores.length, uniqueScores);
      if (
        uniqueScores.length == 2 &&
        (howMany(uniqueScores[0], rollResult) == 2 ||
          howMany(uniqueScores[0], rollResult) == 3)
      ) {
        return {
          key: entry.key,
          value: 25,
          subject: 0,
        };
      }
      let highestValue = 0;
      let candidates = [];
      for (const score of uniqueScores) {
        const n = howMany(score, rollResult);
        if (n >= 2) {
          candidates.push({ subject: score, n: n });
        } else if (score > highestValue) {
          highestValue = score;
        }
      }
      console.log(candidates, "cand");
      if (candidates.length == 2) {
        subject = Math.max(candidates[0].subject, candidates[1].subject);
        i = 4;

        exp = 1;
        j = 2;
      } else if (candidates.length == 1) {
        subject = highestValue;
        i = 4 - Math.min(candidates[0].n, 3);
        exp = 5 - i;
        j = i + 1;
      } else {
        subject = highestValue;
        const secondHighest = uniqueScores
          .filter((value) => value !== subject)
          .sort()[-1];
        i = 2;
        j = 5;
        exp = 5 - i;
      }
      console.log(highestValue, subject, i);

      x = 25;
      p = (1 / 6) ** exp;
      break;
    case "small":
    case "large":
      findSequences(uniqueScores.sort(), 4);
      return {
        key: entry.key,
        value: -1,
        subject: 0,
      };
    default:
      [subject, x] = scoreRules[entry.key];
      i = howMany(subject, rollResult);
      j = 5;
      break;
  }

  if (subject !== 0) {
    //Upper section logic - finds and ranks expected outcomes
    if (!i)
      i = rollResult.reduce((a, b) => {
        if (b == subject) {
          return a + 1;
        } else {
          return a;
        }
      }, 0);
    if (!j) {
      j = dice - i;
    }
    if (p == 0) {
      p = (1 / 6) ** j;
    }

    let p2 = 0;
    for (let k = 1; k <= dice; k++) {
      const Ci = factorialize(i) / (factorialize(k) * factorialize(i - k));
      let pm = p * k;
      let pnm = (1 - p) ** (i - k);
      const pCi = Ci * pm * pnm;
      const Cj = factorialize(k) / (factorialize(j) * factorialize(k - j));
      pm = p * j;
      pnm = (1 - p) ** (k - j);
      const pCj = Cj * pm * pnm;
      p2 += pCi * pCj;
    }
    return {
      key: entry.key,
      value: Math.abs(p2) * x,
      subject: subject,
    };
  } else {
    //lower section logic - finds and ranks expected outcomes
    return { key: entry.key, value: 0, subject, subject };
  }
}

function cpuTurn() {
  const rollResult = roll();
  const rollScore = checkScores(rollResult);

  const allScores = {
    ones: rollScore[0],
    twos: rollScore[1],
    threes: rollScore[2],
    fours: rollScore[3],
    fives: rollScore[4],
    sixes: rollScore[5],
    threeOAK: rollScore[8],
    fourOAK: rollScore[9],
    full: rollScore[10],
    small: rollScore[11],
    large: rollScore[12],
    chance: rollScore[13],
    yahtzee: rollScore[14],
  };

  const expectations = [];
  const entries = Object.entries(allScores).reduce((acc, [key, value]) => {
    key !== "chance" && acc.push({ key: key, value: value });

    return acc;
  }, []);

  let bestMove = [];

  if (rolls === 2) {
    for (const entry of entries) {
      const expectation = firstExpectation(entry, rollResult);
      expectations.push(expectation);
    }

    let max = 0;
    for (const expectation of expectations) {
      if (expectation.value >= max) {
        max = expectation.value;
        bestMove = [expectation.key, expectation.subject];
      }
    }
  }
  console.log(expectations);
  console.log(bestMove);
}
