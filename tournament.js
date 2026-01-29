export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createMatches(images) {
  const matches = [];
  for (let i = 0; i < images.length; i += 2) {
    if (images[i + 1]) {
      matches.push({ left: images[i], right: images[i + 1] });
    } else {
      matches.push({ left: images[i], right: null }); // bye
    }
  }
  return matches;
}

export function createTournament(images) {
  return {
    round: 1,
    currentMatchIndex: 0,
    matches: createMatches(shuffle(images)),
    nextRoundPool: [],
  };
}

export function getCurrentMatch(state) {
  return state.matches[state.currentMatchIndex];
}

export function recordWin(state, winner, loser = null) {
  if (loser) {
    winner.history.push(loser.id);
  }
  state.nextRoundPool.push(winner);
}

export function advanceMatch(state) {
  state.currentMatchIndex++;

  if (state.currentMatchIndex >= state.matches.length) {
    if (state.nextRoundPool.length === 1) {
      return "DONE";
    }

    state.round++;
    state.matches = createMatches(state.nextRoundPool);
    state.currentMatchIndex = 0;
    state.nextRoundPool = [];
  }

  return "CONTINUE";
}
