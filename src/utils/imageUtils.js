export function getIconUrlForGameCenter (gameCenter) {
  // game amount
  const gamesCount = Object.keys(gameCenter.games).length
  let amount
  if (gamesCount <= 3) {
    amount = 'l'
  } else if (gamesCount > 15) {
    amount = 'h'
  } else {
    amount = 'm'
  }

  // logo
  const logo = gameCenter.logo || 'game'

  return `/img/marker_${logo}_${amount}.png`
}
