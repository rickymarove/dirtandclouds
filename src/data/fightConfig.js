export const FIGHT_CONFIG = {
  heroMaxHealth: 100,
  villainMaxHealth: 100,
  heroSpeed: 200,
  villainSpeed: 110,
  villainBackoffSpeed: 140,
  heroPunchDamage: 10,
  villainPunchDamage: 10,
  heroPunchReach: 40,
  villainPunchReach: 40,
  heroPunchCooldown: 400, // ms
  villainAttackInterval: 1500, // ms (attack cooldown counted from start of each attack)
  villainWindupDuration: 300, // ms
  villainBackoffDuration: 500, // ms
  knockbackDistance: 30, // px
  knockbackDuration: 150, // ms
  stunDuration: 250, // ms
  screenShakeDuration: 120, // ms
  screenShakeIntensity: 0.008,
  fightIntroDuration: 1000, // ms
  spaceCooldownAfterDialogue: 300, // ms
  arenaMinX: 1560,
  arenaMaxX: 2285,
  minSeparation: 46
};
