const followState = new Map();

export function isFollowing(userId) {
  return followState.get(userId) === true;
}

export async function toggleFollow(userId) {
  const currentState = isFollowing(userId);
  const nextState = !currentState;

  followState.set(userId, nextState);

  window.dispatchEvent(
    new CustomEvent("indo:follow-changed", {
      detail: {
        userId,
        following: nextState
      }
    })
  );

  return nextState;
}
