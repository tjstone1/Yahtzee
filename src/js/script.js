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
let turn = 1;

function handleSelect(selection) {
  if (!player || rolls == 3) return;
  select(selection);
}
function select(target) {
  if (!target.innerText) {
    target.innerText = 0;
  } else if (!previewValues.includes(target)) {
    console.log("not found");
    return;
  } else {
    console.log("found");
    target.style.color = "black";
    previewValues = previewValues.filter((cell) => {
      if (cell !== target) {
        return cell;
      }
    });

    scores[player ? "player" : "cpu"] += parseInt(target.innerText);
  }

  togglePlayer();
}

for (let i = 0; i < 17; i++) {
  if (i === 0 || i === 7 || i === 8 || i === 16) {
    continue;
  }
  const cell = scoreRows[i].children[1];
  cell.addEventListener("click", (e) => handleSelect(e.target));
  cells.push(cell);
}

function togglePlayer() {
  clearPreviews(previewValues);
  previewValues = [];
  player = !player;
  rolls = 3;
  counterDisplay.innerText = `Rolls remaining: ${rolls}`;
  resetDice();

  if (!player) {
    cpuTurn();
  } else if (turn == 13) {
    console.log("DONE");
  } else {
    turn++;
  }
}

function resetDice() {
  for (let i = 0; i < 5; i++) {
    dice[i].value = i + 1;
    dice[i].element.innerText = i + 1;
    dice[i].locked = false;
    dice[i].element.style.backgroundColor = "#ffeedd";
  }
}

function toggleLock(index) {
  dice[index].locked = !dice[index].locked;
  if (dice[index].locked) {
    dice[index].element.style.backgroundColor = "red";
  } else {
    dice[index].element.style.backgroundColor = "#ffeedd";
  }
}

function handleToggleLock(index) {
  if (!player || rolls == 3) return;
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
      scoreRows[i].cells[col].style.color = "red";
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

function roll() {
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
  let minMissing = { count: Infinity, values: [] };
  let resultSequence = [];

  const minDiceRoll = diceRolls[0];
  const maxDiceRoll = diceRolls[diceRolls.length - 1];

  const startValue = Math.max(1, minDiceRoll - (length - diceRolls.length));
  const endValue = Math.min(6, maxDiceRoll + (length - diceRolls.length));

  for (let i = startValue; i <= endValue - length + 1; i++) {
    let sequence = [];
    let current = i;

    for (let j = 0; j < length; j++) {
      sequence.push(current++);
    }

    let missing = countMissing(sequence, diceRolls);

    if (missing.count < minMissing.count) {
      minMissing = missing;
      resultSequence = sequence.slice();
    }
  }

  return [resultSequence, minMissing];
}

function countMissing(sequence, diceRolls) {
  let missingCount = 0;
  let missingValues = [];
  for (let i = 0; i < sequence.length; i++) {
    if (!diceRolls.includes(sequence[i])) {
      missingValues.push(sequence[i]);
      missingCount++;
    }
  }
  const missing = { count: missingCount, values: missingValues };
  return missing;
}

function getExpectations(entry, rollResult) {
  let subject = 0;
  let x;
  let i;
  let j;
  let dice = 5;
  let uniqueScores = getUniqueScores(rollResult);
  let p = 0;
  let sequence = [];
  let gaps;
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
      p = (1 / 6) ** dice;

      break;
    case "full":
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
      if (candidates.length == 2) {
        subject = Math.max(candidates[0].subject, candidates[1].subject);
        i = 4;

        exp = 1;
        j = 2;
      } else if (candidates.length == 1) {
        subject = highestValue;
        i = Math.min(candidates[0].n, 3) + 1;
        exp = 5 - i;
        j = 5;
      } else {
        subject = highestValue;
        i = 2;
        j = 5;
        exp = 5 - i;
      }

      x = 25;
      p = (1 / 6) ** exp;
      break;
    case "small":
      [sequence, gaps] = findSequences(uniqueScores.sort(), 4);
    case "large":
      if (sequence.length == 0) {
        [sequence, gaps] = findSequences(uniqueScores.sort(), 5);
      }
      if (gaps.count == 0) {
        return {
          key: entry.key,
          value: entry.key == "small" ? 30 : 40,
          subject: 0,
        };
      }

      const n = sequence.length;
      subject = sequence.filter((item) => !gaps.values.includes(item));
      x = sequence.length == 4 ? 30 : 40;
      i = 5 - gaps.count;
      j = 5;
      p = (1 / 6) ** gaps.count;
      break;
    default:
      [target, x] = scoreRules[entry.key];
      i = howMany(target, rollResult);
      subject = Array.from({ length: 5 - i }, () => target);
      j = 5;
      break;
  }

  if (subject !== 0) {
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
    let pC = 0;
    let p2 = 0;
    if (rolls == 2) {
      for (let k = 1; k <= 5; k++) {
        const pCi = calculatepC(p, i, k);
        const pCj = calculatepC(p, k, j);
        pC += pCi * pCj;
      }
    } else if (rolls == 1) {
      for (let k = 1; k <= i; k++) {
        const pCij = calculatepC(p, i, j);
        pC += pCij;
      }
    }
    p2 = pC;

    return {
      key: entry.key,
      value: Math.abs(p2) * x,
      subject: subject,
    };
  }
}

function calculatepC(p, a, b) {
  const c = factorialize(a) / (factorialize(b) * factorialize(a - b));
  let pm = p * b;
  let pnm = (1 - p) ** (a - b);
  const pC = c * pm * pnm;
  return pC;
}

let scoreTypes = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "threeOAK",
  "fourOAK",
  "full",
  "small",
  "large",
  "chance",
  "yahtzee",
];

let usedTypes = [];

function cpuTurn() {
  while (!player && rolls > 0) {
    const rollResult = roll();
    let allScores = {
      ones: scoreRows[1].children[2].innerText,
      twos: scoreRows[2].children[2].innerText,
      threes: scoreRows[3].children[2].innerText,
      fours: scoreRows[4].children[2].innerText,
      fives: scoreRows[5].children[2].innerText,
      sixes: scoreRows[6].children[2].innerText,
      threeOAK: scoreRows[9].children[2].innerText,
      fourOAK: scoreRows[10].children[2].innerText,
      full: scoreRows[11].children[2].innerText,
      small: scoreRows[12].children[2].innerText,
      large: scoreRows[13].children[2].innerText,
      chance: scoreRows[14].children[2].innerText,
      yahtzee: scoreRows[15].children[2].innerText,
    };

    allScores = Object.keys(allScores)
      .filter((key) => !usedTypes.includes(key))
      .reduce((newObj, key) => {
        newObj[key] = allScores[key];
        return newObj;
      }, {});

    const expectations = [];
    const entries = Object.entries(allScores).reduce((acc, [key, value]) => {
      rolls > 0
        ? key !== "chance" &&
          acc.push({ key: key, value: value !== "0" ? parseInt(value) : 0 })
        : acc.push({ key: key, value: value !== "0" ? parseInt(value) : 0 });

      return acc;
    }, []);

    console.log("entries", entries);

    let bestMove;

    if (rolls > 0) {
      for (const entry of entries) {
        const expectation = getExpectations(entry, rollResult);
        expectations.push(expectation);
      }
      bestMove = expectations[0].key;
      let max = 0;
      for (const expectation of expectations) {
        if (expectation.value >= max) {
          max = expectation.value;
          bestMove = expectation;
        }
      }
    } else {
      console.log("dead", !bestMove, bestMove);
      let max = 0;
      for (const key of Object.keys(allScores)) {
        if (allScores[key] > max) {
          max = allScores[key];
          bestMove = { key: key, value: max, subject: 0 };
        }
      }
      if (!bestMove) {
        let key = Object.keys(allScores)[0];
        console.log("key", key);
        bestMove = { key: key, value: allScores[key] || 0, subject: 0 };
      }
    }
    console.log(bestMove.key, bestMove.value, bestMove.subject);
    doBestMove(bestMove);
  }
}

const cpuCells = {
  ones: scoreRows[1].children[2],
  twos: scoreRows[2].children[2],
  threes: scoreRows[3].children[2],
  fours: scoreRows[4].children[2],
  fives: scoreRows[5].children[2],
  sixes: scoreRows[6].children[2],
  threeOAK: scoreRows[9].children[2],
  fourOAK: scoreRows[10].children[2],
  full: scoreRows[11].children[2],
  small: scoreRows[12].children[2],
  large: scoreRows[13].children[2],
  chance: scoreRows[14].children[2],
  yahtzee: scoreRows[15].children[2],
};

function doBestMove(bestMove) {
  console.log(usedTypes, "used");
  const [move, lock] = [bestMove.key, bestMove.subject];

  if (
    (typeof lock == "number" && lock == 0) ||
    (typeof lock == "object" && lock.includes == 0)
  ) {
    usedTypes.push(move);
    select(cpuCells[move]);
  } else if (rolls == 0) {
    togglePlayer();
  } else {
    if (typeof lock == "number") {
      const toLock = dice.find((die) => die.value == lock);
      toLock.locked = true;
    } else {
      let diceClones = [...dice];

      for (const value of lock) {
        const toLock = diceClones.find((die) => die.value == value);
        toLock.locked = true;
        diceClones = diceClones.filter((die) => die.element !== toLock.element);
      }
    }
  }
}
