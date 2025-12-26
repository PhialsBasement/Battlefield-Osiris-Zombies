const VERSION = [2, 2, 1];
const INSTANT_START = false;
const MIN_PLAYERS_TO_START = 1;
// Wave Configuration
let currentWave = 0;
let zombiesPerWave = 5;
let zombiesAlive = 0;
let zombiesSpawned = 0;
let waveInProgress = false;
let waveDelay = 15;
let timeUntilNextWave = waveDelay;
let isSpecialWave = false;
let lastMonitorTime: number = 0;
// Spawner Configuration
const ZOMBIE_SPAWNER_START_ID = 101;
const ZOMBIE_SPAWNER_END_ID = 120;
const ZOMBIE_SPAWNER_COUNT = ZOMBIE_SPAWNER_END_ID - ZOMBIE_SPAWNER_START_ID + 1;
const MONITOR_INTERVAL = 5; // Print every 5 seconds
// Debris Configuration
const DEBRIS_INTERACT_START = 400;
const DEBRIS_INTERACT_END = 499;
const DEBRIS_OBJECT_OFFSET = 100;
const DEBRIS_ICON_OFFSET = 200;
const DEBRIS_SPAWNER_MAP: {[debrisId: number]: number[]} = {
    402: [21, 22, 23, 24],
    468: [25, 26, 27, 28, 29]
};
// Debris costs
const DEBRIS_COST_CHEAP = 1000;   // 400-429
const DEBRIS_COST_MEDIUM = 2500;  // 430-459
const DEBRIS_COST_EXPENSIVE = 5000; // 460-499
// Points system
const POINTS_BODY_HIT = 5;
const POINTS_HEADSHOT_HIT = 10;
const POINTS_KILL = 100;
const POINTS_HEADSHOT_KILL = 110;
const POINTS_PER_REVIVE = 100;
// Weapon-upper-Grader Configuration
const WUG_INTERACT_ID = 710;
const WUG_WORLD_ICON_ID = 711;
const WUG_TIER_1_COST = 5000;
const WUG_TIER_2_COST = 15000;
const WUG_TIER_3_COST = 30000;
// M44 Special Configuration
const M44_EXPLOSION_RADIUS = 1.7;
const M44_EXPLOSION_BASE_DAMAGE = 300;
const M44_PLAYER_DAMAGE = 15;
const M44_SHOT_COOLDOWN = 0.15;
const MAX_EXPLOSIONS_PER_SECOND = 5;
// Sledgehammer Special Configuration
const SLEDGEHAMMER_BASE_BONUS = 177;
// Wall Buys
const WALL_WEAPON_INTERACT_START = 200;
const WALL_WEAPON_INTERACT_END = 211;
const WALL_WEAPON_ICON_OFFSET = 100; // Icons are at 3xx
// Suprise Mechanics Configuration
const SUPRISE_MECHANICS_COST = 950;
const SUPRISE_MECHANICS_INTERACT_ID = 800;
const SUPRISE_MECHANICS_ICON_ID = 801;
const SUPRISE_MECHANICS_SPIN_TIME = 3;
const SUPRISE_MECHANICS_SPIN_SPEED = 0.15;
// Power-ups
const POWERUP_DROP_CHANCE = 0.05;
const POWERUP_MAX_AMMO_CHANCE = 0.7;
const POWERUP_NUKE_CHANCE = 0.3;
const POWERUP_DESPAWN_TIME = 30;
const NUKE_KILL_POINTS = 400;
const POWERUP_POOL_START = 1001;
const POWERUP_POOL_SIZE = 4;
// Floating Points Configuration
const FLOATING_POINTS_POOL_START = 1100;
const FLOATING_POINTS_POOL_SIZE = 20;
const FLOATING_POINTS_DURATION = 2.0;
const FLOATING_POINTS_RISE_HEIGHT = 0.8;
const FLOATING_POINTS_STEPS = 20;
// Perks
const HEALTHPERK_INTERACT_ID = 211;
const HEALTHPERK_WORLD_ICON_ID = 311;
const HEALTHPERK_COST = 3000;
const HEALTHPERK_HEALTH_MULTIPLIER = 2.5;
const SPEEDPERK_INTERACT_ID = 212;
const SPEEDPERK_WORLD_ICON_ID = 312;
const SPEEDPERK_COST = 2500;
const SPEEDPERK_SPEED_MULTIPLIER = 1.15;
const DAMAGEPERK_INTERACT_ID = 213;
const DAMAGEPERK_WORLD_ICON_ID = 313;
const DAMAGEPERK_COST = 5250;
const DAMAGEPERK_DAMAGE_MULTIPLIER = 1.33;
// Notification System
const NOTIFICATION_DURATION = 4;
const NOTIFICATION_FADE_START = 3;
const NOTIFICATION_MAX_QUEUE = 3;
let damageEventInProgress: boolean = false;
// Game State
let gameStarted = false;
let playerCount = 0;
let survivors: mod.Player[] = [];
let zombies: mod.Player[] = [];
let playerPoints: Map<number, number> = new Map();
let clearedDebris: Set<number> = new Set();
let SupriseMechanicsInUse = false;
// Track pending zombies
let pendingZombies: Set<number> = new Set();
// Weapon-upper-Grader Tracking
let playerPrimaryWugTier: {[playerId: number]: number} = {};
let playerSecondaryWugTier: {[playerId: number]: number} = {};
let playerMeleeWugTier: {[playerId: number]: number} = {};
let playerPrimaryWeapon: {[playerId: number]: mod.Weapons} = {};
let playerSecondaryWeapon: {[playerId: number]: mod.Weapons} = {};
let playerMeleeWeapon: {[playerId: number]: mod.Gadgets} = {};
// M44 Tracking
let m44LastShotTime: {[playerId: number]: number} = {};
let activeExplosions: number = 0;
let lastExplosionReset: number = 0;
// Sledgehammer Tracking
let meleeKillTracking: {[zombieId: number]: MeleeKillTracking} = {};
let piercingInProgress: {[playerId: number]: boolean} = {};
let piercerUIActive: {[playerId: number]: boolean} = {};
// Damage Tracking
let damageTracking: {[victimId: number]: DamageTracking} = {};
let insideDamageEvent: Set<number> = new Set();
// UI Colors
const RED_COLOR = [1, 0, 0];
const GREEN_COLOR = [0, 1, 0];
const WHITE_COLOR = [1, 1, 1];
const YELLOW_COLOR = [1, 1, 0];
const ZEROVEC: mod.Vector = mod.CreateVector(0, 0, 0);
// Tracking
let spawnerPerformance: Map<number, SpawnerPerformance> = new Map();
let zombieTrackingData: Map<number, ZombieTracking> = new Map();
let episodeRewards: number[] = [];
let currentEpisodeReward: number = 0;
// Power-up system
let activePowerUps: {[key: number]: PowerUp} = {};
let nextPowerUpId: number = 1000;
// Floating points system
let nextFloatingPointsIndex: number = 0;
let activeFloatingPoints: Set<number> = new Set();
// Perk tracking
let playerHasHealthPerk: {[playerId: number]: boolean} = {};
let playerHasSpeedPerk: {[playerId: number]: boolean} = {};
let playerHasDamagePerk: {[playerId: number]: boolean} = {};
// Lore
let hasShownLoreIntro: boolean = false;
// Debug
const DEBUGGING: boolean = false; // Master switch - set to true for development
let debugMode: boolean = false;
let debugKnifeHeld: {[playerId: number]: boolean} = {};
// Notification System
let activeNotifications: {[playerId: number]: UINotification[]} = {};
let playerNotificationQueues: {[playerId: number]: UINotification[]} = {};
let notificationContainersCreated: {[playerId: number]: boolean} = {};
interface WallWeapon {
    id: number;
    weapon: mod.Weapons | mod.Gadgets;
    weaponPackage: mod.WeaponPackage;
    cost: number;
    name: string;
    worldIconId: number;
    isMelee?: boolean;
}
interface UINotification {
    message: mod.Message;
    spawnTime: number;
}
interface SpawnerPerformance {
    spawnerId: number;
    timesUsed: number;
    totalReward: number;
    avgReward: number;
    weight: number;
    // Metrics for reward calculation
    totalDamageDealt: number;
    totalSurvivalTime: number;
    totalTimeToContact: number;
    zombiesSpawned: number;
    zombiesKilled: number;
    playerKills: number;
}
interface ZombieTracking {
    spawnerId: number;
    spawnTime: number;
    firstContactTime: number | null;
    damageDealt: number;
    killedPlayer: boolean;
}
interface PowerUp {
    interactId: number;
    worldIconId: number;
    type: "maxammo" | "nuke";
    position: mod.Vector;
    spawnTime: number;
}
const LEARNING_RATE: number = 0.15;
const DISCOUNT_FACTOR: number = 0.9;
const EXPLORATION_RATE: number = 0.2;
const MIN_WEIGHT: number = 0.1;
const MAX_WEIGHT: number = 10.0;
interface SupriseMechanicsWeapon {
    weapon: mod.Weapons;
    nameKey: string;
}
interface DamageTracking {
    lastHealth: number;
    lastAttacker: number;
    lastTime: number;
}
interface MeleeKillTracking {
    killerId: number;
    wugTier: number;
    timestamp: number;
}
interface ChainTarget {
    player: mod.Player;
    distance: number;
}
interface FrozenZombie {
    player: mod.Player;
    originalSpeed: mod.MoveSpeed;
}
const SUPRISE_MECHANICS_WEAPONS: SupriseMechanicsWeapon[] = [
    { weapon: mod.Weapons.AssaultRifle_AK4D, nameKey: mod.stringkeys.ID_M_WW_WEAPON_AK4D },
{ weapon: mod.Weapons.AssaultRifle_B36A4, nameKey: mod.stringkeys.ID_M_WW_WEAPON_B36A4 },
{ weapon: mod.Weapons.AssaultRifle_KORD_6P67, nameKey: mod.stringkeys.ID_M_WW_WEAPON_KORD },
{ weapon: mod.Weapons.AssaultRifle_TR_7, nameKey: mod.stringkeys.ID_M_WW_WEAPON_TR7 },
{ weapon: mod.Weapons.Carbine_M4A1, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M4A1 },
{ weapon: mod.Weapons.Carbine_AK_205, nameKey: mod.stringkeys.ID_M_WW_WEAPON_AK205 },
{ weapon: mod.Weapons.SMG_PW7A2, nameKey: mod.stringkeys.ID_M_WW_WEAPON_PW7A2 },
{ weapon: mod.Weapons.SMG_UMG_40, nameKey: mod.stringkeys.ID_M_WW_WEAPON_UMG40 },
{ weapon: mod.Weapons.SMG_SGX, nameKey: mod.stringkeys.ID_M_WW_WEAPON_SGX },
{ weapon: mod.Weapons.SMG_SL9, nameKey: mod.stringkeys.ID_M_WW_WEAPON_SL9 },
{ weapon: mod.Weapons.Shotgun_M87A1, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M87A1 },
{ weapon: mod.Weapons.Shotgun_M1014, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M1014 },
{ weapon: mod.Weapons.Sniper_SV_98, nameKey: mod.stringkeys.ID_M_WW_WEAPON_SV98 },
{ weapon: mod.Weapons.Sniper_M2010_ESR, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M2010 },
{ weapon: mod.Weapons.LMG_M240L, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M240L },
{ weapon: mod.Weapons.LMG_KTS100_MK8, nameKey: mod.stringkeys.ID_M_WW_WEAPON_KTS100 },
{ weapon: mod.Weapons.DMR_M39_EMR, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M39EMR },
{ weapon: mod.Weapons.DMR_SVDM, nameKey: mod.stringkeys.ID_M_WW_WEAPON_SVDM },
{ weapon: mod.Weapons.Sidearm_M44, nameKey: mod.stringkeys.ID_M_WW_WEAPON_M44_BOX }
];
function initializeSpawnerLearning(availableSpawners: number[]): void {
    for (let spawnerId of availableSpawners) {
        if (!spawnerPerformance.has(spawnerId)) {
            spawnerPerformance.set(spawnerId, {
                spawnerId: spawnerId,
                timesUsed: 0,
                totalReward: 0,
                avgReward: 0,
                weight: 1.0,
                totalDamageDealt: 0,
                totalSurvivalTime: 0,
                totalTimeToContact: 0,
                zombiesSpawned: 0,
                zombiesKilled: 0,
                playerKills: 0
            });
        }
    }
}
function trackZombieSpawn(zombieId: number, spawnerId: number): void {
    zombieTrackingData.set(zombieId, {
        spawnerId: spawnerId,
        spawnTime: mod.GetMatchTimeElapsed(),
                           firstContactTime: null,
                           damageDealt: 0,
                           killedPlayer: false
    });

    let stats = spawnerPerformance.get(spawnerId);
    if (stats) {
        stats.timesUsed++;
        stats.zombiesSpawned++;
    }

    console.log("[RL] Tracking zombie ", zombieId, " from spawner ", spawnerId);
}
// Track zombie damage dealt
function trackZombieDamage(zombieId: number, damage: number): void {
    let tracking = zombieTrackingData.get(zombieId);
    if (tracking) {
        tracking.damageDealt += damage;

        // Record first contact time
        if (tracking.firstContactTime === null && damage > 0) {
            tracking.firstContactTime = mod.GetMatchTimeElapsed();
            console.log("[RL] Zombie ", zombieId, " first contact at ", tracking.firstContactTime - tracking.spawnTime, "s");
        }
    }
}
// Track zombie kill player
function trackZombiePlayerKill(zombieId: number): void {
    let tracking = zombieTrackingData.get(zombieId);
    if (tracking) {
        tracking.killedPlayer = true;
        console.log("[RL] Zombie ", zombieId, " killed a player!");
    }
}
// Calculate reward when zombie dies
function calculateZombieReward(zombieId: number): number {
    let tracking = zombieTrackingData.get(zombieId);
    if (!tracking) return 0;

    let reward = 0;
    let currentTime = mod.GetMatchTimeElapsed();
    let survivalTime = currentTime - tracking.spawnTime;
    let timeToContact = tracking.firstContactTime ? (tracking.firstContactTime - tracking.spawnTime) : 999;

    // POSITIVE REWARDS (good spawns)

    // Damage dealt (scaled)
    if (tracking.damageDealt > 0) {
        reward += Math.min(tracking.damageDealt / 50, 3.0); // Max +3 for damage
    }

    // Survival time (zombies that engage for a while)
    if (survivalTime >= 5 && survivalTime <= 30) {
        reward += 1.5; // Sweet spot
    } else if (survivalTime > 30) {
        reward += 0.5; // Survived long but maybe didn't engage well
    }

    // Quick contact (zombie reached player fast)
    if (timeToContact < 5) {
        reward += 2.0;
    } else if (timeToContact < 10) {
        reward += 1.0;
    }

    // Player kill (HUGE reward)
    if (tracking.killedPlayer) {
        reward += 10.0;
    }

    // NEGATIVE REWARDS (bad spawns)

    // Died instantly (spawned in bad position)
    if (survivalTime < 2) {
        reward -= 2.0;
    }

    // Never made contact (spawned too far or got stuck)
    if (timeToContact > 30) {
        reward -= 3.0;
    }

    // No damage dealt (ineffective spawn)
    if (tracking.damageDealt === 0 && survivalTime > 5) {
        reward -= 1.0;
    }

    console.log("[RL] Zombie ", zombieId, " reward: ", reward.toFixed(2),
                " (dmg:", tracking.damageDealt,
                " survival:", survivalTime.toFixed(1),
                " contact:", timeToContact.toFixed(1), ")");

    return reward;
}
// Update spawner weight with Q-learning
function updateSpawnerWeight(spawnerId: number, reward: number): void {
    let stats = spawnerPerformance.get(spawnerId);
    if (!stats) return;

    // Update total reward
    stats.totalReward += reward;
    stats.avgReward = stats.totalReward / stats.timesUsed;

    // Q-learning update
    // Q(s,a) = Q(s,a) + ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ±[R + ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ³ * max(Q(s')) - Q(s,a)]
    // Simplified since we're not doing full state-action pairs
    let oldWeight = stats.weight;
    let tdError = reward - stats.avgReward;
    stats.weight = stats.weight + LEARNING_RATE * tdError;

    // Clamp weight
    stats.weight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, stats.weight));

    currentEpisodeReward += reward;

    console.log("[RL] Spawner ", spawnerId, " weight: ", oldWeight.toFixed(3), " -> ", stats.weight.toFixed(3),
                " (reward: ", reward.toFixed(2), ", avg: ", stats.avgReward.toFixed(2), ")");
}
// Record zombie death and update spawner
function recordZombieDeath(zombieId: number): void {
    let tracking = zombieTrackingData.get(zombieId);
    if (!tracking) return;

    let reward = calculateZombieReward(zombieId);
    updateSpawnerWeight(tracking.spawnerId, reward);

    // Update spawner stats
    let stats = spawnerPerformance.get(tracking.spawnerId);
    if (stats) {
        stats.zombiesKilled++;
        stats.totalDamageDealt += tracking.damageDealt;

        let survivalTime = mod.GetMatchTimeElapsed() - tracking.spawnTime;
        stats.totalSurvivalTime += survivalTime;

        if (tracking.firstContactTime) {
            stats.totalTimeToContact += (tracking.firstContactTime - tracking.spawnTime);
        }

        if (tracking.killedPlayer) {
            stats.playerKills++;
        }
    }

    // Clean up tracking
    zombieTrackingData.delete(zombieId);
}
// End of wave - summarize episode
function endLearningEpisode(): void {
    episodeRewards.push(currentEpisodeReward);

    console.log("=== WAVE ", currentWave, " LEARNING SUMMARY ===");
    console.log("Episode Reward: ", currentEpisodeReward.toFixed(2));
    console.log("Spawner Performance:");

    // Sort spawners by weight
    let sortedSpawners = Array.from(spawnerPerformance.values())
    .filter(s => s.timesUsed > 0)
    .sort((a, b) => b.weight - a.weight);

    for (let stats of sortedSpawners.slice(0, 5)) { // Top 5
        let avgDamage = stats.zombiesKilled > 0 ? stats.totalDamageDealt / stats.zombiesKilled : 0;
        let avgSurvival = stats.zombiesKilled > 0 ? stats.totalSurvivalTime / stats.zombiesKilled : 0;
        let avgContact = stats.zombiesKilled > 0 ? stats.totalTimeToContact / stats.zombiesKilled : 0;

        console.log("  Spawner ", stats.spawnerId,
                    " - Weight: ", stats.weight.toFixed(3),
                    " | Uses: ", stats.timesUsed,
                    " | Avg Reward: ", stats.avgReward.toFixed(2),
                    " | Avg Dmg: ", avgDamage.toFixed(1),
                    " | Avg Survival: ", avgSurvival.toFixed(1), "s",
                    " | Player Kills: ", stats.playerKills);
    }

    // Reset episode reward
    currentEpisodeReward = 0;

    // Clean up any lingering zombie tracking (shouldn't happen but safety)
    zombieTrackingData.clear();
}
// Select spawner using epsilon-greedy with learned weights
function selectSpawnerWithLearning(availableSpawners: number[], playerPos: mod.Vector): number {
    // Epsilon-greedy: sometimes explore random spawner
    if (Math.random() < EXPLORATION_RATE) {
        let randomIndex = Math.floor(Math.random() * availableSpawners.length);
        console.log("[RL] EXPLORING - Random spawner: ", availableSpawners[randomIndex]);
        return availableSpawners[randomIndex];
    }

    // Otherwise, use learned weights combined with distance
    let spawnerWeights: { id: number, weight: number }[] = [];

    for (let spawnerId of availableSpawners) {
        try {
            let baseSpawnerNumber = spawnerId - 100;
            let spatialConnectorId = 12000 + baseSpawnerNumber;
            let markerObject = mod.GetSpatialObject(spatialConnectorId);
            let markerPos = mod.GetObjectPosition(markerObject);

            let playerX = mod.XComponentOf(playerPos);
            let playerZ = mod.ZComponentOf(playerPos);
            let markerX = mod.XComponentOf(markerPos);
            let markerZ = mod.ZComponentOf(markerPos);

            let deltaX = playerX - markerX;
            let deltaZ = playerZ - markerZ;
            let distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

            // Combine distance weight with learned weight
            let distanceWeight = 10000 / ((distance + 1) * (distance + 1));
            let learnedWeight = spawnerPerformance.get(spawnerId)?.weight || 1.0;

            // Final weight is product of both
            let finalWeight = distanceWeight * learnedWeight;

            spawnerWeights.push({ id: spawnerId, weight: finalWeight });

            console.log("[RL] Spawner ", spawnerId,
                        " dist:", distance.toFixed(1),
                        " distWeight:", distanceWeight.toFixed(2),
                        " learned:", learnedWeight.toFixed(3),
                        " final:", finalWeight.toFixed(2));
        } catch(e) {
            console.log("Failed to calculate weight for spawner ", spawnerId);
        }
    }

    if (spawnerWeights.length === 0) {
        return availableSpawners[0];
    }

    // Weighted random selection
    let totalWeight = 0;
    for (let sw of spawnerWeights) {
        totalWeight += sw.weight;
    }

    let randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let sw of spawnerWeights) {
        cumulativeWeight += sw.weight;
        if (randomValue <= cumulativeWeight) {
            console.log("[RL] EXPLOITING - Selected spawner: ", sw.id, " (weight: ", sw.weight.toFixed(2), ")");
            return sw.id;
        }
    }

    return spawnerWeights[0].id;
}
function createNotificationContainer(player: mod.Player): void {
    let playerId = mod.GetObjId(player);

    if (notificationContainersCreated[playerId]) return;

    mod.AddUIContainer(
        "notif_container_" + playerId,
        mod.CreateVector(0, -100, 0),
                       mod.CreateVector(600, 260, 0),
                       mod.UIAnchor.BottomCenter,
                       mod.GetUIRoot(),
                       false,
                       10,
                       mod.CreateVector(0.05, 0.05, 0.05),
                       0.95,
                       mod.UIBgFill.Blur,
                       mod.UIDepth.AboveGameUI,
                       player
    );

    let containerWidget = mod.FindUIWidgetWithName("notif_container_" + playerId);

    mod.AddUIContainer(
        "notif_accent_" + playerId,
        mod.CreateVector(-300, -100, 0),
                       mod.CreateVector(4, 260, 0),
                       mod.UIAnchor.BottomCenter,
                       mod.GetUIRoot(),
                       false,
                       0,
                       mod.CreateVector(1, 0.5, 0),
                       1,
                       mod.UIBgFill.Solid,
                       mod.UIDepth.AboveGameUI,
                       player
    );

    for (let i = 0; i < 3; i++) {
        let yOffset = -100 + (i * 80);

        mod.AddUIText(
            "notif_text_" + playerId + "_" + i,
            mod.CreateVector(0, yOffset, 0),
                      mod.CreateVector(560, 60, 0),
                      mod.UIAnchor.Center,
                      containerWidget,
                      false,
                      5,
                      mod.CreateVector(0, 0, 0),
                      0,
                      mod.UIBgFill.None,
                      mod.Message(""),
                      28,
                      mod.CreateVector(1, 1, 1),
                      1,
                      mod.UIAnchor.Center,
                      player
        );
    }

    notificationContainersCreated[playerId] = true;
}
function getNotificationAlpha(notification: UINotification, slotIndex: number): number {
    let currentTime = mod.GetMatchTimeElapsed();
    let age = currentTime - notification.spawnTime;

    if (slotIndex === 2) {
        if (age < NOTIFICATION_FADE_START) {
            return 1;
        } else {
            let fadeProgress = (age - NOTIFICATION_FADE_START) / (NOTIFICATION_DURATION - NOTIFICATION_FADE_START);
            return Math.max(0, 1 - fadeProgress);
        }
    }

    return 1;
}
async function showUINotification(player: mod.Player, message: mod.Message): Promise<void> {
    let playerId = mod.GetObjId(player);
    console.log("showUINotification called for player ", playerId);

    if (!notificationContainersCreated[playerId]) {
        createNotificationContainer(player);
    }

    if (!playerNotificationQueues[playerId]) {
        playerNotificationQueues[playerId] = [];
    }

    let queue = playerNotificationQueues[playerId];

    if (queue.length >= NOTIFICATION_MAX_QUEUE) {
        queue.pop();
    }

    queue.unshift({
        message: message,
        spawnTime: mod.GetMatchTimeElapsed()
    });

    let containerWidget = mod.FindUIWidgetWithName("notif_container_" + playerId);
    let accentWidget = mod.FindUIWidgetWithName("notif_accent_" + playerId);

    if (containerWidget) mod.SetUIWidgetVisible(containerWidget, true);
    if (accentWidget) mod.SetUIWidgetVisible(accentWidget, true);

    for (let i = 0; i < 3; i++) {
        let textWidget = mod.FindUIWidgetWithName("notif_text_" + playerId + "_" + i);

        if (queue[i]) {
            if (textWidget) {
                mod.SetUITextLabel(textWidget, queue[i].message);
                mod.SetUIWidgetVisible(textWidget, true);
                mod.SetUITextAlpha(textWidget, 1);
            }
        } else {
            if (textWidget) {
                mod.SetUIWidgetVisible(textWidget, false);
            }
        }
    }

    cleanupNotificationAfterDelay(playerId, queue[0].spawnTime);
}
async function cleanupNotificationAfterDelay(playerId: number, spawnTime: number): Promise<void> {
    await mod.Wait(NOTIFICATION_DURATION);

    if (!playerNotificationQueues[playerId]) return;

    let queue = playerNotificationQueues[playerId];

    let index = queue.findIndex(n => n.spawnTime === spawnTime);

    if (index !== -1) {
        queue.splice(index, 1);

        for (let i = 0; i < 3; i++) {
            let textWidget = mod.FindUIWidgetWithName("notif_text_" + playerId + "_" + i);

            if (queue[i]) {
                if (textWidget) {
                    mod.SetUITextLabel(textWidget, queue[i].message);
                    mod.SetUIWidgetVisible(textWidget, true);
                    mod.SetUITextAlpha(textWidget, 1);
                }
            } else {
                if (textWidget) {
                    mod.SetUIWidgetVisible(textWidget, false);
                }
            }
        }

        if (queue.length === 0) {
            let containerWidget = mod.FindUIWidgetWithName("notif_container_" + playerId);
            let accentWidget = mod.FindUIWidgetWithName("notif_accent_" + playerId);

            if (containerWidget) mod.SetUIWidgetVisible(containerWidget, false);
            if (accentWidget) mod.SetUIWidgetVisible(accentWidget, false);
        }
    }
}
// Override the DisplayNotificationMessage function
mod.DisplayNotificationMessage = function(message: mod.Message, target?: mod.Player | mod.Team): void {
    console.log("DisplayNotificationMessage override called");

    if (target) {
        if (mod.IsType(target, mod.Types.Player)) {
            let player = target as mod.Player;
            if (mod.IsPlayerValid(player)) {
                showUINotification(player, message);
            }
        } else if (mod.IsType(target, mod.Types.Team)) {
            survivors.forEach(player => {
                if (mod.IsPlayerValid(player)) {
                    showUINotification(player, message);
                }
            });
        }
    } else {
        survivors.forEach(player => {
            if (mod.IsPlayerValid(player)) {
                showUINotification(player, message);
            }
        });
    }
};
function setupPerks(): void {
    try {
        // HealthPerk
        let irongutsInteract = mod.GetInteractPoint(HEALTHPERK_INTERACT_ID);
        mod.EnableInteractPoint(irongutsInteract, true);

        let irongutsIcon = mod.GetWorldIcon(HEALTHPERK_WORLD_ICON_ID);
        mod.SetWorldIconText(irongutsIcon, mod.Message(mod.stringkeys.ID_M_WW_PERK_HEALTHPERK));
        mod.SetWorldIconColor(irongutsIcon, mod.CreateVector(1, 0, 0)); // Red
        mod.SetWorldIconImage(irongutsIcon, mod.WorldIconImages.Cross);
        mod.EnableWorldIconImage(irongutsIcon, true);
        mod.EnableWorldIconText(irongutsIcon, true);

        // Speed perk
        let speedperkInteract = mod.GetInteractPoint(SPEEDPERK_INTERACT_ID);
        mod.EnableInteractPoint(speedperkInteract, true);

        let speedperkIcon = mod.GetWorldIcon(SPEEDPERK_WORLD_ICON_ID);
        mod.SetWorldIconText(speedperkIcon, mod.Message(mod.stringkeys.ID_M_WW_PERK_SPEEDPERK));
        mod.SetWorldIconColor(speedperkIcon, mod.CreateVector(1, 0.5, 0)); // Orange
        mod.SetWorldIconImage(speedperkIcon, mod.WorldIconImages.Alert);
        mod.EnableWorldIconImage(speedperkIcon, true);
        mod.EnableWorldIconText(speedperkIcon, true);

        // Damage perk
        let damageperkInteract = mod.GetInteractPoint(DAMAGEPERK_INTERACT_ID);
        mod.EnableInteractPoint(damageperkInteract, true);

        let damageperkIcon = mod.GetWorldIcon(DAMAGEPERK_WORLD_ICON_ID);
        mod.SetWorldIconText(damageperkIcon, mod.Message(mod.stringkeys.ID_M_WW_PERK_DAMAGEPERK));
        mod.SetWorldIconColor(damageperkIcon, mod.CreateVector(1, 1, 0)); // Yellow
        mod.SetWorldIconImage(damageperkIcon, mod.WorldIconImages.Alert);
        mod.EnableWorldIconImage(damageperkIcon, true);
        mod.EnableWorldIconText(damageperkIcon, true);

        console.log("Perks setup complete");
    } catch(e) {
        console.log("Failed to setup perks: ", e);
    }
}
async function showLoreIntro(): Promise<void> {
    console.log("Showing lore intro...");

    const textChunks = [
        mod.stringkeys.ID_M_WW_LORE_CHUNK1,
        mod.stringkeys.ID_M_WW_LORE_CHUNK2,
        mod.stringkeys.ID_M_WW_LORE_CHUNK3,
        mod.stringkeys.ID_M_WW_LORE_CHUNK4,
        mod.stringkeys.ID_M_WW_LORE_CHUNK5,
        mod.stringkeys.ID_M_WW_LORE_CHUNK6,
        mod.stringkeys.ID_M_WW_LORE_CHUNK7
    ];

    let uiWidgets: {[key: number]: {bg: any, title: any, timestamp: any, text: any}} = {};

    // Create UI for all survivors
    survivors.forEach(player => {
        if (!mod.IsPlayerValid(player)) return;

        let playerId = mod.GetObjId(player);

        mod.AddUIContainer(
            "lore_bg_" + playerId,
            mod.CreateVector(0, 0, 0),
                           mod.CreateVector(1920, 1080, 0),
                           mod.UIAnchor.Center,
                           mod.GetUIRoot(),
                           true,
                           0,
                           mod.CreateVector(0, 0, 0),
                           0.95,
                           mod.UIBgFill.Solid,
                           mod.UIDepth.AboveGameUI,
                           player
        );

        mod.AddUIText(
            "lore_title_" + playerId,
            mod.CreateVector(0, -200, 0),
                      mod.CreateVector(700, 60, 0),
                      mod.UIAnchor.Center,
                      mod.GetUIRoot(),
                      true,
                      10,
                      mod.CreateVector(0.1, 0, 0),
                      0.8,
                      mod.UIBgFill.Solid,
                      mod.Message(mod.stringkeys.ID_M_WW_LORE_TITLE),
                      36,
                      mod.CreateVector(1, 0.2, 0.2),
                      1,
                      mod.UIAnchor.Center,
                      mod.UIDepth.AboveGameUI,
                      player
        );

        mod.AddUIText(
            "lore_timestamp_" + playerId,
            mod.CreateVector(0, 200, 0),
                      mod.CreateVector(600, 40, 0),
                      mod.UIAnchor.Center,
                      mod.GetUIRoot(),
                      true,
                      10,
                      mod.CreateVector(0, 0, 0),
                      0,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.ID_M_WW_LORE_TIMESTAMP),
                      20,
                      mod.CreateVector(0.7, 0.7, 0.7),
                      1,
                      mod.UIAnchor.Center,
                      mod.UIDepth.AboveGameUI,
                      player
        );

        mod.AddUIText(
            "lore_text_" + playerId,
            mod.CreateVector(0, 0, 0),
                      mod.CreateVector(900, 500, 0),
                      mod.UIAnchor.Center,
                      mod.GetUIRoot(),
                      true,
                      20,
                      mod.CreateVector(0, 0, 0),
                      0,
                      mod.UIBgFill.None,
                      mod.Message(""),
                      24,
                      mod.CreateVector(0.9, 0.9, 0.9),
                      1,
                      mod.UIAnchor.Center,
                      mod.UIDepth.AboveGameUI,
                      player
        );

        uiWidgets[playerId] = {
            bg: mod.FindUIWidgetWithName("lore_bg_" + playerId),
                      title: mod.FindUIWidgetWithName("lore_title_" + playerId),
                      timestamp: mod.FindUIWidgetWithName("lore_timestamp_" + playerId),
                      text: mod.FindUIWidgetWithName("lore_text_" + playerId)
        };
    });

    // Display chunks progressively
    for (let i = 0; i < textChunks.length; i++) {
        for (let playerId in uiWidgets) {
            if (uiWidgets[playerId] && uiWidgets[playerId].text) {
                mod.SetUITextLabel(uiWidgets[playerId].text, mod.Message(textChunks[i]));
            }
        }

        // CHECK FOR KNIFE SKIP
        for (let survivor of survivors) {
            if (mod.IsPlayerValid(survivor)) {
                if (mod.IsInventorySlotActive(survivor, mod.InventorySlots.MeleeWeapon)) {
                    console.log("DEBUG: Knife detected during lore intro - skipping");

                    // Clean up immediately
                    for (let playerId in uiWidgets) {
                        let widgets = uiWidgets[playerId];
                        if (widgets.bg) mod.DeleteUIWidget(widgets.bg);
                        if (widgets.title) mod.DeleteUIWidget(widgets.title);
                        if (widgets.timestamp) mod.DeleteUIWidget(widgets.timestamp);
                        if (widgets.text) mod.DeleteUIWidget(widgets.text);
                    }

                    console.log("Lore intro skipped");
                    return;
                }
            }
        }

        await mod.Wait(1.5);
    }

    await mod.Wait(3);

    console.log("Deleting lore UI...");

    // Clean up UI
    for (let playerId in uiWidgets) {
        let widgets = uiWidgets[playerId];

        if (widgets.bg) {
            mod.DeleteUIWidget(widgets.bg);
            console.log("Deleted bg for player ", playerId);
        }
        if (widgets.title) {
            mod.DeleteUIWidget(widgets.title);
            console.log("Deleted title for player ", playerId);
        }
        if (widgets.timestamp) {
            mod.DeleteUIWidget(widgets.timestamp);
            console.log("Deleted timestamp for player ", playerId);
        }
        if (widgets.text) {
            mod.DeleteUIWidget(widgets.text);
            console.log("Deleted text for player ", playerId);
        }
    }

    console.log("Lore intro complete. Starting wave 1...");
}
function spawnPowerUp(position: mod.Vector): void {
    let powerUpType: "maxammo" | "nuke" = Math.random() < POWERUP_MAX_AMMO_CHANCE ? "maxammo" : "nuke";

    let worldIconId = POWERUP_POOL_START + (nextPowerUpId % POWERUP_POOL_SIZE);
    nextPowerUpId++;

    let spawnPos = mod.Add(position, mod.CreateVector(0, 1, 0));

    let worldIcon = mod.GetWorldIcon(worldIconId);
    mod.SetWorldIconPosition(worldIcon, spawnPos);

    if (powerUpType === "maxammo") {
        mod.SetWorldIconText(worldIcon, mod.Message(mod.stringkeys.ID_M_WW_POWERUP_MAXAMMO));
        mod.SetWorldIconColor(worldIcon, mod.CreateVector(0, 1, 0)); // Green
        mod.SetWorldIconImage(worldIcon, mod.WorldIconImages.Triangle);
    } else {
        mod.SetWorldIconText(worldIcon, mod.Message(mod.stringkeys.ID_M_WW_POWERUP_NUKE));
        mod.SetWorldIconColor(worldIcon, mod.CreateVector(1, 0, 0)); // Red
        mod.SetWorldIconImage(worldIcon, mod.WorldIconImages.Bomb);
    }

    mod.EnableWorldIconImage(worldIcon, true);
    mod.EnableWorldIconText(worldIcon, true);

    activePowerUps[worldIconId] = {
        interactId: worldIconId,
        worldIconId: worldIconId,
        type: powerUpType,
        position: spawnPos,
        spawnTime: mod.GetMatchTimeElapsed()
    };

    console.log("Spawned ", powerUpType, " power-up at world icon ", worldIconId);

    despawnPowerUpAfterDelay(worldIconId);
}
async function despawnPowerUpAfterDelay(worldIconId: number): Promise<void> {
    await mod.Wait(POWERUP_DESPAWN_TIME);

    if (activePowerUps[worldIconId]) {
        despawnPowerUp(worldIconId);
    }
}
function despawnPowerUp(worldIconId: number): void {
    let powerUp = activePowerUps[worldIconId];
    if (!powerUp) return;

    let worldIcon = mod.GetWorldIcon(powerUp.worldIconId);
    mod.EnableWorldIconImage(worldIcon, false);
    mod.EnableWorldIconText(worldIcon, false);

    delete activePowerUps[worldIconId];

    console.log("Despawned power-up at world icon ", worldIconId);
}
function activateMaxAmmo(): void {
    survivors.forEach(player => {
        if (mod.IsPlayerValid(player) && safeIsPlayerAlive(player)) {
            mod.SetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon, 999);
            mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon, 999);
            mod.SetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon, 999);
            mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.SecondaryWeapon, 999);

            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_POWERUP_MAXAMMO_ACTIVATED),
                                           player
            );
        }
    });

    console.log("Max Ammo activated!");
}
function activateNuke(picker: mod.Player): void {
    let zombiesKilled = 0;

    zombies.forEach(zombie => {
        if (mod.IsPlayerValid(zombie) && safeIsPlayerAlive(zombie)) {
            mod.Kill(zombie);
            zombiesKilled++;
        }
    });

    AddPlayerPoints(picker, NUKE_KILL_POINTS * zombiesKilled);

    zombies = [];
    zombiesAlive = 0;

    survivors.forEach(player => {
        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.ID_M_WW_POWERUP_NUKE_ACTIVATED),
                                       player
        );
    });

    console.log("Nuke activated! Killed ", zombiesKilled, " zombies");
}
// ============================================
// FLOATING POINTS FUNCTIONS
// ============================================
function spawnFloatingPoints(position: mod.Vector, points: number, isHeadshot: boolean): void {
    // Get next available world icon from pool
    let worldIconId = FLOATING_POINTS_POOL_START + nextFloatingPointsIndex;
    nextFloatingPointsIndex = (nextFloatingPointsIndex + 1) % FLOATING_POINTS_POOL_SIZE;

    // If this icon is still active, skip (pool exhausted)
    if (activeFloatingPoints.has(worldIconId)) {
        return;
    }

    activeFloatingPoints.add(worldIconId);

    // Position slightly above the hit location
    let spawnPos = mod.Add(position, mod.CreateVector(0, 1.5, 0));

    try {
        let worldIcon = mod.GetWorldIcon(worldIconId);
        mod.SetWorldIconPosition(worldIcon, spawnPos);
        mod.SetWorldIconText(worldIcon, mod.Message(mod.stringkeys.ID_M_WW_FLOATING_POINTS, points));

        // White for normal, orange for headshot
        if (isHeadshot) {
            mod.SetWorldIconColor(worldIcon, mod.CreateVector(1, 0.5, 0)); // Orange
        } else {
            mod.SetWorldIconColor(worldIcon, mod.CreateVector(1, 1, 1)); // White
        }

        mod.EnableWorldIconImage(worldIcon, false);
        mod.EnableWorldIconText(worldIcon, true);

        // Start the animation
        animateFloatingPoints(worldIconId, spawnPos);
    } catch (e) {
        console.log("Failed to spawn floating points: ", e);
        activeFloatingPoints.delete(worldIconId);
    }
}

async function animateFloatingPoints(worldIconId: number, startPos: mod.Vector): Promise<void> {
    let worldIcon = mod.GetWorldIcon(worldIconId);
    let stepDelay = FLOATING_POINTS_DURATION / FLOATING_POINTS_STEPS;
    let risePerStep = FLOATING_POINTS_RISE_HEIGHT / FLOATING_POINTS_STEPS;

    for (let i = 1; i <= FLOATING_POINTS_STEPS; i++) {
        await mod.Wait(stepDelay);

        let newY = mod.YComponentOf(startPos) + (risePerStep * i);
        let newPos = mod.CreateVector(
            mod.XComponentOf(startPos),
            newY,
            mod.ZComponentOf(startPos)
        );

        try {
            mod.SetWorldIconPosition(worldIcon, newPos);
        } catch (e) {
            break;
        }
    }

    // Hide and release the icon
    try {
        mod.EnableWorldIconText(worldIcon, false);
    } catch (e) {}

    activeFloatingPoints.delete(worldIconId);
}
function createM44Package(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_Iron_Sights, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_6rnd_Speedloader, pkg);
    return pkg;
}
function createPW7A2Package(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_30rnd_Magazine, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_Iron_Sights, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_8_Extended, pkg);
    return pkg;
}
function createM87A1Package(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_8rnd_Magazine, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_Iron_Sights, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Ammo_Buckshot, pkg);
    return pkg;
}
function createSV98Package(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_SSDS_600x, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_650mm_Factory, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_10rnd_Magazine, pkg);
    return pkg;
}
function createM240LPackage(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_100rnd_Belt_Box, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_Iron_Sights, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Bottom_Bipod, pkg);
    return pkg;
}
function createM39EMRPackage(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_20rnd_Magazine, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_R4T_200x, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_18_EBR, pkg);
    return pkg;
}
function createAK4DPackage(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_30rnd_Magazine, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_Iron_Sights, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_16_Rifle, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Muzzle_Flash_Hider, pkg);
    return pkg;
}
function createUMG40Package(): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_40rnd_Magazine, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Scope_CQ_RDS_125x, pkg);
    mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_9_Factory, pkg);
    return pkg;
}
const WALL_WEAPONS: {[key: number]: WallWeapon} = {
    202: {
        id: 202,
        weapon: mod.Weapons.SMG_PW7A2,
        weaponPackage: createPW7A2Package(),
        cost: 800,
        name: "ID_M_WW_WALLBUY_SMG",
        worldIconId: 302
    },
    203: {
        id: 203,
        weapon: mod.Weapons.Shotgun_M87A1,
        weaponPackage: createM87A1Package(),
        cost: 1500,
        name: "ID_M_WW_WALLBUY_SHOTGUN",
        worldIconId: 303
    },
    204: {
        id: 204,
        weapon: mod.Weapons.Sniper_SV_98,
        weaponPackage: createSV98Package(),
        cost: 2000,
        name: "ID_M_WW_WALLBUY_SNIPER",
        worldIconId: 304
    },
    205: {
        id: 205,
        weapon: mod.Weapons.LMG_M240L,
        weaponPackage: createM240LPackage(),
        cost: 2500,
        name: "ID_M_WW_WALLBUY_LMG",
        worldIconId: 305
    },
    206: {
        id: 206,
        weapon: mod.Weapons.DMR_M39_EMR,
        weaponPackage: createM39EMRPackage(),
        cost: 1800,
        name: "ID_M_WW_WALLBUY_DMR",
        worldIconId: 306
    },
    207: {
        id: 207,
        weapon: mod.Weapons.AssaultRifle_AK4D,
        weaponPackage: createAK4DPackage(),
        cost: 1400,
        name: "ID_M_WW_WALLBUY_AK4D",
        worldIconId: 307
    },
    208: {
        id: 208,
        weapon: mod.Weapons.SMG_UMG_40,
        weaponPackage: createUMG40Package(),
        cost: 900,
        name: "ID_M_WW_WALLBUY_UMG40",
        worldIconId: 308
    },
    209: {
        id: 209,
        weapon: mod.Weapons.Sidearm_M44,
        weaponPackage: createM44Package(),
        cost: 1000,
        name: "ID_M_WW_WALLBUY_M44",
        worldIconId: 309
    },
    210: {
        id: 210,
        weapon: mod.Gadgets.Melee_Sledgehammer,
        weaponPackage: mod.CreateNewWeaponPackage(),
        cost: 1500,
        name: "ID_M_WW_WALLBUY_SLEDGEHAMMER",
        worldIconId: 310,
        isMelee: true
    }
};
// ============================================
// Weapon-upper-Grader FUNCTIONS
// ============================================
function setupWepUpGrader(): void {
    try {
        let wugInteract = mod.GetInteractPoint(WUG_INTERACT_ID);
        mod.EnableInteractPoint(wugInteract, true);

        let wugIcon = mod.GetWorldIcon(WUG_WORLD_ICON_ID);
        mod.SetWorldIconText(wugIcon, mod.Message(mod.stringkeys.ID_M_WW_WUG_MACHINE));
        mod.SetWorldIconColor(wugIcon, mod.CreateVector(1, 0, 1)); // Purple
        mod.SetWorldIconImage(wugIcon, mod.WorldIconImages.Alert);
        mod.EnableWorldIconImage(wugIcon, true);
        mod.EnableWorldIconText(wugIcon, true);

        console.log("Weapon-upper-Grader setup at interact ", WUG_INTERACT_ID);
    } catch(e) {
        console.log("Failed to setup Weapon-upper-Grader: ", e);
    }
}
function getWugCost(currentTier: number): number {
    if (currentTier === 0) return WUG_TIER_1_COST;
    if (currentTier === 1) return WUG_TIER_2_COST;
    if (currentTier === 2) return WUG_TIER_3_COST;
    return 0;
}
function getWugDamageMultiplier(tier: number): number {
    if (tier === 1) return 2;
    if (tier === 2) return 3;
    if (tier === 3) return 4;
    return 1;
}
function useWepUpGrader(player: mod.Player): void {
    let playerId = mod.GetObjId(player);

    let isSecondary = mod.IsInventorySlotActive(player, mod.InventorySlots.SecondaryWeapon);
    let isPrimary = mod.IsInventorySlotActive(player, mod.InventorySlots.PrimaryWeapon);
    let isMelee = mod.IsInventorySlotActive(player, mod.InventorySlots.MeleeWeapon);

    if (!isSecondary && !isPrimary && !isMelee) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_WUG_HOLD_WEAPON), player);
        return;
    }

    let currentTier = 0;

    if (isMelee) {
        if (playerMeleeWugTier[playerId] === undefined) {
            playerMeleeWugTier[playerId] = 0;
        }
        currentTier = playerMeleeWugTier[playerId];
    } else if (isSecondary) {
        if (playerSecondaryWugTier[playerId] === undefined) {
            playerSecondaryWugTier[playerId] = 0;
        }
        currentTier = playerSecondaryWugTier[playerId];
    } else {
        if (playerPrimaryWugTier[playerId] === undefined) {
            playerPrimaryWugTier[playerId] = 0;
        }
        currentTier = playerPrimaryWugTier[playerId];
    }

    if (currentTier >= 3) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_WUG_MAX_TIER), player);
        return;
    }

    let upgradeCost = getWugCost(currentTier);
    let playerPoints = GetPlayerPoints(player);

    if (playerPoints < upgradeCost) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, upgradeCost), player);
        return;
    }

    // Deduct points
    AddPlayerPoints(player, -upgradeCost);

    if (isMelee) {
        playerMeleeWugTier[playerId]++;
        let newTier = playerMeleeWugTier[playerId];

        if (newTier === 1) {
            showPiercerAwakensUI(player);
        } else {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_WUG_UPGRADED, getWugDamageMultiplier(newTier)),
                                           player
            );
        }
    } else if (isSecondary) {
        playerSecondaryWugTier[playerId]++;
        let newTier = playerSecondaryWugTier[playerId];
        let multiplier = getWugDamageMultiplier(newTier);

        mod.SetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon, 999);
        mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.SecondaryWeapon, 999);

        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.ID_M_WW_WUG_UPGRADED, multiplier),
                                       player
        );
    } else {
        playerPrimaryWugTier[playerId]++;
        let newTier = playerPrimaryWugTier[playerId];
        let multiplier = getWugDamageMultiplier(newTier);

        mod.SetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon, 999);
        mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon, 999);

        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.ID_M_WW_WUG_UPGRADED, multiplier),
                                       player
        );
    }

    console.log("Player ", playerId, " upgraded weapon to tier ", currentTier + 1);
}
// ============================================
// SLEDGEHAMMER SPECIAL FUNCTIONS
// ============================================
async function showPiercerAwakensUI(player: mod.Player): Promise<void> {
    let playerId = mod.GetObjId(player);

    if (piercerUIActive[playerId]) return;
    piercerUIActive[playerId] = true;

    mod.AddUIContainer(
        "piercer_bg_" + playerId,
        mod.CreateVector(0, -150, 0),
                       mod.CreateVector(700, 110, 0),
                       mod.UIAnchor.Center,
                       mod.GetUIRoot(),
                       true,
                       0,
                       mod.CreateVector(0.05, 0.05, 0.05),
                       0.85,
                       mod.UIBgFill.Blur,
                       mod.UIDepth.AboveGameUI,
                       player
    );

    mod.AddUIContainer(
        "piercer_accent_" + playerId,
        mod.CreateVector(-350, -150, 0),
                       mod.CreateVector(6, 110, 0),
                       mod.UIAnchor.Center,
                       mod.GetUIRoot(),
                       true,
                       0,
                       mod.CreateVector(1, 0.4, 0),
                       1,
                       mod.UIBgFill.Solid,
                       mod.UIDepth.AboveGameUI,
                       player
    );

    mod.AddUIText(
        "piercer_text_" + playerId,
        mod.CreateVector(0, -150, 0),
                  mod.CreateVector(680, 100, 0),
                  mod.UIAnchor.Center,
                  mod.GetUIRoot(),
                  true,
                  0,
                  mod.CreateVector(0, 0, 0),
                  0,
                  mod.UIBgFill.None,
                  mod.Message(mod.stringkeys.ID_M_WW_SLEDGEHAMMER_PIERCER),
                  48,
                  mod.CreateVector(1, 0.85, 0.3),
                  1,
                  mod.UIAnchor.Center,
                  mod.UIDepth.AboveGameUI,
                  player
    );

    await mod.Wait(2);

    let bgWidget = mod.FindUIWidgetWithName("piercer_bg_" + playerId);
    let accentWidget = mod.FindUIWidgetWithName("piercer_accent_" + playerId);
    let textWidget = mod.FindUIWidgetWithName("piercer_text_" + playerId);

    if (bgWidget) mod.DeleteUIWidget(bgWidget);
    if (accentWidget) mod.DeleteUIWidget(accentWidget);
    if (textWidget) mod.DeleteUIWidget(textWidget);

    piercerUIActive[playerId] = false;
}
async function showPiercerChainUI(player: mod.Player, chainCount: number): Promise<void> {
    let playerId = mod.GetObjId(player);

    try {
        let textWidget = mod.FindUIWidgetWithName("chain_text_" + playerId);
        if (textWidget) {
            mod.SetUITextLabel(textWidget, mod.Message(mod.stringkeys.ID_M_WW_SLEDGEHAMMER_CHAIN, chainCount));
            return;
        }
    } catch (e) {}

    mod.AddUIContainer(
        "chain_bg_" + playerId,
        mod.CreateVector(200, 150, 0),
                       mod.CreateVector(280, 70, 0),
                       mod.UIAnchor.TopRight,
                       mod.GetUIRoot(),
                       true,
                       0,
                       mod.CreateVector(0.08, 0.08, 0.08),
                       0.9,
                       mod.UIBgFill.Blur,
                       mod.UIDepth.AboveGameUI,
                       player
    );

    mod.AddUIContainer(
        "chain_accent_" + playerId,
        mod.CreateVector(200, 150, 0),
                       mod.CreateVector(4, 70, 0),
                       mod.UIAnchor.TopRight,
                       mod.GetUIRoot(),
                       true,
                       0,
                       mod.CreateVector(1, 0.5, 0),
                       1,
                       mod.UIBgFill.Solid,
                       mod.UIDepth.AboveGameUI,
                       player
    );

    mod.AddUIText(
        "chain_text_" + playerId,
        mod.CreateVector(200, 150, 0),
                  mod.CreateVector(260, 70, 0),
                  mod.UIAnchor.TopRight,
                  mod.GetUIRoot(),
                  true,
                  0,
                  mod.CreateVector(0, 0, 0),
                  0,
                  mod.UIBgFill.None,
                  mod.Message(mod.stringkeys.ID_M_WW_SLEDGEHAMMER_CHAIN, chainCount),
                  40,
                  mod.CreateVector(1, 1, 1),
                  1,
                  mod.UIAnchor.CenterLeft,
                  mod.UIDepth.AboveGameUI,
                  player
    );
}
async function executePiercingSequence(
    killer: mod.Player,
    targets: ChainTarget[],
    wugTier: number
): Promise<void> {
    let killerId = mod.GetObjId(killer);

    let frozenZombies: FrozenZombie[] = [];

    for (let target of targets) {
        if (!mod.IsPlayerValid(target.player)) continue;
        if (!mod.GetSoldierState(target.player, mod.SoldierStateBool.IsAlive)) continue;

        let currentSpeed = mod.MoveSpeed.Sprint;
        frozenZombies.push({
            player: target.player,
            originalSpeed: currentSpeed
        });

        mod.AIIdleBehavior(target.player);
        mod.AIEnableTargeting(target.player, true);

        console.log("Froze zombie ", mod.GetObjId(target.player));
    }

    let baseDrillDamage = 841 * wugTier;
    let damageMultiplier = 1.0;
    let chainsKilled = 0;
    let maxDrills = Math.min(frozenZombies.length, 50);

    for (let i = 0; i < maxDrills; i++) {
        let frozen = frozenZombies[i];

        if (!mod.IsPlayerValid(frozen.player)) continue;
        if (!mod.GetSoldierState(frozen.player, mod.SoldierStateBool.IsAlive)) continue;

        damageMultiplier += 0.5;
        let drillDamage = Math.floor(baseDrillDamage * damageMultiplier);

        let zombiePos = mod.GetSoldierState(frozen.player, mod.SoldierStateVector.GetPosition);
        if (!zombiePos) continue;

        try {
            let drillVFX: mod.VFX = mod.SpawnObject(
                mod.RuntimeSpawn_Common.FX_BASE_Sparks_Pulse_L,
                zombiePos,
                mod.CreateVector(0, 0, 0)
            );

            mod.SetVFXScale(drillVFX, 0.3 + (damageMultiplier * 0.1));

            let colorIntensity = Math.min(1.0, damageMultiplier / 5);
            mod.SetVFXColor(drillVFX, mod.CreateVector(1, 0.3 + colorIntensity, 0));

            mod.EnableVFX(drillVFX, true);

            console.log("Spawned drill VFX at zombie ", mod.GetObjId(frozen.player));
        } catch (e) {
            console.log("Drill VFX error: ", e);
        }

        console.log("DRILL HIT ", i + 1, ": zombie ", mod.GetObjId(frozen.player), " for ", drillDamage, " damage (multiplier: ", damageMultiplier, "x)");

        mod.DealDamage(frozen.player, drillDamage, killer);
        chainsKilled++;

        showPiercerChainUI(killer, chainsKilled + 1);

        if (i < maxDrills - 1) {
            await mod.Wait(0.5);
        }
    }

    for (let frozen of frozenZombies) {
        if (!mod.IsPlayerValid(frozen.player)) continue;
        if (!mod.GetSoldierState(frozen.player, mod.SoldierStateBool.IsAlive)) continue;

        mod.AISetMoveSpeed(frozen.player, frozen.originalSpeed);
        mod.AIEnableTargeting(frozen.player, true);

        console.log("Unfroze surviving zombie ", mod.GetObjId(frozen.player));
    }

    await mod.Wait(1.5);

    let playerId = mod.GetObjId(killer);
    try {
        let bgWidget = mod.FindUIWidgetWithName("chain_bg_" + playerId);
        if (bgWidget) mod.DeleteUIWidget(bgWidget);

        let accentWidget = mod.FindUIWidgetWithName("chain_accent_" + playerId);
        if (accentWidget) mod.DeleteUIWidget(accentWidget);

        let textWidget = mod.FindUIWidgetWithName("chain_text_" + playerId);
        if (textWidget) mod.DeleteUIWidget(textWidget);
    } catch (e) {}

    piercingInProgress[killerId] = false;
}
// ============================================
// HELPER FUNCTIONS
// ============================================
function safeGetPlayerPosition(player: mod.Player): mod.Vector | undefined {
    try {
        if (!mod.IsPlayerValid(player)) return undefined;
        return mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
    } catch (e) {
        return undefined;
    }
}
function safeGetPlayerHealth(player: mod.Player): number {
    try {
        if (!mod.IsPlayerValid(player)) return 0;
        return mod.GetSoldierState(player, mod.SoldierStateNumber.CurrentHealth);
    } catch (e) {
        return 0;
    }
}
function safeIsPlayerAlive(player: mod.Player): boolean {
    try {
        if (!mod.IsPlayerValid(player)) return false;
        return mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive);
    } catch (e) {
        return false;
    }
}
function safeIsPlayerAI(player: mod.Player): boolean {
    try {
        if (!mod.IsPlayerValid(player)) return false;
        return mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier);
    } catch (e) {
        return false;
    }
}
function setupWallWeapons(): void {
    for (let id in WALL_WEAPONS) {
        let wallWeapon = WALL_WEAPONS[id];

        try {
            let interactPoint = mod.GetInteractPoint(wallWeapon.id);
            mod.EnableInteractPoint(interactPoint, true);

            let worldIcon = mod.GetWorldIcon(wallWeapon.worldIconId);
            mod.SetWorldIconText(worldIcon, mod.Message(mod.stringkeys[wallWeapon.name]));
            mod.SetWorldIconColor(worldIcon, mod.CreateVector(0, 1, 0)); // Green
            mod.SetWorldIconImage(worldIcon, mod.WorldIconImages.Skull);
            mod.EnableWorldIconImage(worldIcon, true);
            mod.EnableWorldIconText(worldIcon, true);

            console.log("Set up wall weapon ", wallWeapon.id);
        } catch(e) {
            console.log("Failed to set up wall weapon ", wallWeapon.id, ": ", e);
        }
    }
}
function purchaseWallWeapon(interactId: number, player: mod.Player): void {
    let wallWeapon = WALL_WEAPONS[interactId];
    if (!wallWeapon) {
        console.log("Wall weapon not found: ", interactId);
        return;
    }

    let playerPoints = GetPlayerPoints(player);

    if (playerPoints < wallWeapon.cost) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, wallWeapon.cost), player);
        console.log("Player cannot afford wall weapon. Has ", playerPoints, " needs ", wallWeapon.cost);
        return;
    }

    let playerId = mod.GetObjId(player);
    let alreadyHas = false;

    if (wallWeapon.isMelee) {
        alreadyHas = mod.HasEquipment(player, wallWeapon.weapon as mod.Gadgets);
    } else {
        alreadyHas = mod.HasEquipment(player, wallWeapon.weapon as mod.Weapons);
    }

    AddPlayerPoints(player, -wallWeapon.cost);

    if (alreadyHas) {
        let targetSlot = mod.InventorySlots.PrimaryWeapon;

        if (wallWeapon.isMelee) {
            targetSlot = mod.InventorySlots.MeleeWeapon;
        } else {
            if (mod.IsInventorySlotActive(player, mod.InventorySlots.PrimaryWeapon)) {
                targetSlot = mod.InventorySlots.PrimaryWeapon;
            } else if (mod.IsInventorySlotActive(player, mod.InventorySlots.SecondaryWeapon)) {
                targetSlot = mod.InventorySlots.SecondaryWeapon;
            }
        }

        if (!wallWeapon.isMelee) {
            mod.SetInventoryMagazineAmmo(player, targetSlot, 999);
            mod.SetInventoryAmmo(player, targetSlot, 999);
        }

        console.log("Player refilled ammo for weapon ", interactId);
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_AMMO_REFILLED), player);
    } else {
        // NEW WEAPON PURCHASE - Reset WuG tiers
        if (wallWeapon.isMelee) {
            // Reset melee WuG tier
            playerMeleeWugTier[playerId] = 0;
            mod.AddEquipment(player, wallWeapon.weapon as mod.Gadgets, mod.InventorySlots.MeleeWeapon);
            playerMeleeWeapon[playerId] = wallWeapon.weapon as mod.Gadgets;
            console.log("Reset melee WuG tier for new weapon");
        } else {
            // Check which slot the weapon goes to and reset that WuG tier
            if (interactId === 209) { // M44 goes to secondary
                playerSecondaryWugTier[playerId] = 0;
                playerSecondaryWeapon[playerId] = wallWeapon.weapon as mod.Weapons;
                console.log("Player ", playerId, " bought M44, reset secondary WuG tier");
            } else { // Everything else goes to primary
                playerPrimaryWugTier[playerId] = 0;
                playerPrimaryWeapon[playerId] = wallWeapon.weapon as mod.Weapons;
                console.log("Player ", playerId, " bought primary weapon, reset primary WuG tier");
            }

            mod.AddEquipment(player, wallWeapon.weapon as mod.Weapons, wallWeapon.weaponPackage);
        }

        console.log("Player purchased wall weapon ", interactId, " for ", wallWeapon.cost, " points");
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_WEAPON_PURCHASED), player);
    }
}
function setupSupriseMechanics(): void {
    try {
        let boxInteract = mod.GetInteractPoint(SUPRISE_MECHANICS_INTERACT_ID);
        mod.EnableInteractPoint(boxInteract, true);

        let boxIcon = mod.GetWorldIcon(SUPRISE_MECHANICS_ICON_ID);
        mod.SetWorldIconText(boxIcon, mod.Message(mod.stringkeys.ID_M_WW_SUPRISE_MECHANICS));
        mod.SetWorldIconColor(boxIcon, mod.CreateVector(1, 0, 1)); // Purple
        mod.SetWorldIconImage(boxIcon, mod.WorldIconImages.Alert);
        mod.EnableWorldIconImage(boxIcon, true);
        mod.EnableWorldIconText(boxIcon, true);

        console.log("Suprise Mechanics setup at interact ", SUPRISE_MECHANICS_INTERACT_ID);
    } catch(e) {
        console.log("Failed to setup Suprise Mechanics: ", e);
    }
}
async function SupriseMechanicsSpin(player: mod.Player): Promise<void> {
    SupriseMechanicsInUse = true;

    let boxIcon = mod.GetWorldIcon(SUPRISE_MECHANICS_ICON_ID);

    let spinStages = [
        { count: 10, speed: 0.2 },
        { count: 8, speed: 0.15 },
        { count: 5, speed: 0.25 },
        { count: 3, speed: 0.4 }
    ];

    for (let stage of spinStages) {
        for (let i = 0; i < stage.count; i++) {
            let randomWeapon = SUPRISE_MECHANICS_WEAPONS[Math.floor(Math.random() * SUPRISE_MECHANICS_WEAPONS.length)];
            mod.SetWorldIconText(boxIcon, mod.Message(randomWeapon.nameKey));
            await mod.Wait(stage.speed);
        }
    }

    let finalWeapon = SUPRISE_MECHANICS_WEAPONS[Math.floor(Math.random() * SUPRISE_MECHANICS_WEAPONS.length)];
    mod.SetWorldIconText(boxIcon, mod.Message(finalWeapon.nameKey));

    let randomPackage = getRandomAttachments(finalWeapon.weapon);
    mod.AddEquipment(player, finalWeapon.weapon, randomPackage);

    let playerId = mod.GetObjId(player);

    // Check if it's M44 (goes to secondary) or other weapon (goes to primary)
    if (finalWeapon.weapon === mod.Weapons.Sidearm_M44) {
        // M44 goes to secondary slot
        playerSecondaryWugTier[playerId] = 0;
        playerSecondaryWeapon[playerId] = finalWeapon.weapon;
        console.log("Player ", playerId, " got M44 from Suprise Mechanics, reset secondary WuG tier");

        mod.SetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon, 999);
        mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.SecondaryWeapon, 999);
    } else {
        // All other weapons go to primary slot
        playerPrimaryWugTier[playerId] = 0;
        playerPrimaryWeapon[playerId] = finalWeapon.weapon;
        console.log("Player ", playerId, " got ", finalWeapon.nameKey, " from Suprise Mechanics, reset primary WuG tier");

        mod.SetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon, 999);
        mod.SetInventoryMagazineAmmo(player, mod.InventorySlots.PrimaryWeapon, 999);
    }

    mod.DisplayNotificationMessage(
        mod.Message(mod.stringkeys.ID_M_WW_SUPRISE_MECHANICS_RECEIVED),
                                   player
    );

    console.log("Suprise Mechanics gave ", finalWeapon.nameKey, " to player ", playerId);

    await mod.Wait(2);

    mod.SetWorldIconText(boxIcon, mod.Message(mod.stringkeys.ID_M_WW_SUPRISE_MECHANICS));

    SupriseMechanicsInUse = false;
}
function getRandomAttachments(weapon: mod.Weapons): mod.WeaponPackage {
    let pkg = mod.CreateNewWeaponPackage();

    const scopes = [
        mod.WeaponAttachments.Scope_Iron_Sights,
        mod.WeaponAttachments.Scope_1p87_150x,
        mod.WeaponAttachments.Scope_R4T_200x,
        mod.WeaponAttachments.Scope_CCO_200x,
        mod.WeaponAttachments.Scope_CQ_RDS_125x
    ];

    const magazines = [
        mod.WeaponAttachments.Magazine_30rnd_Magazine,
        mod.WeaponAttachments.Magazine_40rnd_Magazine,
        mod.WeaponAttachments.Magazine_30rnd_Fast_Mag,
        mod.WeaponAttachments.Magazine_20rnd_Magazine
    ];

    const grips = [
        mod.WeaponAttachments.Bottom_Classic_Vertical,
        mod.WeaponAttachments.Bottom_Folding_Vertical,
        mod.WeaponAttachments.Bottom_Ribbed_Vertical,
        mod.WeaponAttachments.Bottom_Full_Angled
    ];

    const muzzles = [
        mod.WeaponAttachments.Muzzle_Flash_Hider,
        mod.WeaponAttachments.Muzzle_Compensated_Brake,
        mod.WeaponAttachments.Muzzle_Standard_Suppressor
    ];

    mod.AddAttachmentToWeaponPackage(scopes[Math.floor(Math.random() * scopes.length)], pkg);
    mod.AddAttachmentToWeaponPackage(magazines[Math.floor(Math.random() * magazines.length)], pkg);
    mod.AddAttachmentToWeaponPackage(grips[Math.floor(Math.random() * grips.length)], pkg);
    mod.AddAttachmentToWeaponPackage(muzzles[Math.floor(Math.random() * muzzles.length)], pkg);

    return pkg;
}
function useSupriseMechanics(player: mod.Player): void {
    if (SupriseMechanicsInUse) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_BOX_IN_USE), player);
        return;
    }

    let playerPoints = GetPlayerPoints(player);

    if (playerPoints < SUPRISE_MECHANICS_COST) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, SUPRISE_MECHANICS_COST), player);
        return;
    }

    AddPlayerPoints(player, -SUPRISE_MECHANICS_COST);

    SupriseMechanicsSpin(player);
}
function CalculateZombieHealth(wave: number): number {
    if (wave === 1) {
        return 75;
    } else if (wave >= 2 && wave <= 9) {
        let health = wave * 50;
        return Math.min(health, 500);
    } else {
        let health = 475 + ((wave - 9) * 50);
        return Math.min(health, 500);
    }
}
function SetupDebrisWorldIcons(): void {
    for (let interactId = DEBRIS_INTERACT_START; interactId <= DEBRIS_INTERACT_END; interactId++) {
        let iconId = interactId + DEBRIS_ICON_OFFSET;
        let cost = GetDebrisCost(interactId);

        try {
            let worldIcon = mod.GetWorldIcon(iconId);
            let interactPoint = mod.GetInteractPoint(interactId);

            mod.SetWorldIconText(worldIcon, mod.Message(mod.stringkeys.ID_M_WW_DEBRIS_COST, cost));
            mod.SetWorldIconColor(worldIcon, mod.CreateVector(1, 1, 0)); // Yellow
            mod.SetWorldIconImage(worldIcon, mod.WorldIconImages.Cross);
            mod.EnableWorldIconImage(worldIcon, true);
            mod.EnableWorldIconText(worldIcon, true);

            console.log("Set up world icon ", iconId, " for debris ", interactId);
        } catch(e) {
            console.log("Failed to set up world icon ", iconId, ": ", e);
        }
    }
}
function GetAvailableSpawners(): number[] {
    let availableSpawners: number[] = [];

    for (let i = ZOMBIE_SPAWNER_START_ID; i <= ZOMBIE_SPAWNER_END_ID; i++) {
        availableSpawners.push(i);
    }

    clearedDebris.forEach(debrisId => {
        let spawners = DEBRIS_SPAWNER_MAP[debrisId];
        if (spawners) {
            spawners.forEach((spawnerId: number) => {
                availableSpawners.push(spawnerId + 100);
            });
        }
    });

    return availableSpawners;
}
function GetZombieSpeed(wave: number, isSpecial: boolean): mod.MoveSpeed {
    if (isSpecial) {
        return mod.MoveSpeed.Sprint;
    }

    if (wave >= 1 && wave < 5) {
        return mod.MoveSpeed.Walk;
    } else if (wave >= 5 && wave < 10) {
        return mod.MoveSpeed.Run;
    } else {
        return mod.MoveSpeed.Sprint;
    }
}
function GetPlayerPoints(player: mod.Player): number {
    let playerId = mod.GetObjId(player);
    if (!playerPoints.has(playerId)) {
        playerPoints.set(playerId, 0);
    }
    return playerPoints.get(playerId) || 0;
}
function AddPlayerPoints(player: mod.Player, points: number): void {
    let playerId = mod.GetObjId(player);
    let currentPoints = GetPlayerPoints(player);
    playerPoints.set(playerId, currentPoints + points);
    console.log("Player ", playerId, " now has ", currentPoints + points, " points");
}
function GetDebrisCost(interactId: number): number {
    if (interactId >= 400 && interactId <= 429) {
        return DEBRIS_COST_CHEAP;
    } else if (interactId >= 430 && interactId <= 459) {
        return DEBRIS_COST_MEDIUM;
    } else if (interactId >= 460 && interactId <= 499) {
        return DEBRIS_COST_EXPENSIVE;
    }
    return 0;
}
function ClearDebris(interactId: number, player: mod.Player): void {
    let cost = GetDebrisCost(interactId);
    let playerPoints = GetPlayerPoints(player);

    if (playerPoints < cost) {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, cost), player);
        console.log("Player cannot afford debris. Has ", playerPoints, " needs ", cost);
        return;
    }

    AddPlayerPoints(player, -cost);

    let objectId = interactId + DEBRIS_OBJECT_OFFSET;
    let iconId = interactId + DEBRIS_ICON_OFFSET;

    try {
        let debrisObject = mod.GetSpatialObject(objectId);
        let interactPoint = mod.GetInteractPoint(interactId);
        let worldIcon = mod.GetWorldIcon(iconId);

        mod.MoveObject(debrisObject, mod.CreateVector(0, 10000, 0));

        mod.EnableInteractPoint(interactPoint, false);
        mod.EnableWorldIconImage(worldIcon, false);
        mod.EnableWorldIconText(worldIcon, false);

        clearedDebris.add(interactId);

        console.log("Cleared debris ", interactId, " for ", cost, " points");
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_DEBRIS_CLEARED), player);
    } catch(e) {
        console.log("Failed to clear debris ", interactId, ": ", e);
    }
}
export async function OnGameModeStarted() {
    console.log("Zombie Survival v", VERSION[0], ".", VERSION[1], ".", VERSION[2], " Started");

    mod.SetSpawnMode(mod.SpawnModes.AutoSpawn);
    mod.SetGameModeTimeLimit(999999999999999999999999999999999999999999)
    SetupDebrisWorldIcons();
    setupWallWeapons();
    setupSupriseMechanics();
    setupWepUpGrader();
    setupPerks();
    if (!INSTANT_START) {
        while (playerCount < MIN_PLAYERS_TO_START) {
            await mod.Wait(1);
        }
    }

    gameStarted = true;

    await mod.Wait(5);

    // Show lore intro
    if (!hasShownLoreIntro) {
        await showLoreIntro();
        hasShownLoreIntro = true;
    }

    GameLoop();
    UpdateLoop();
    ZombieTargetingLoop();
}
async function GameLoop() {
    let iterations = 0;
    while (gameStarted) {
        iterations++;
        if (iterations % 10 === 0) {
            console.log("GameLoop alive: iteration ", iterations);
        }
        if (!waveInProgress) {
            if (timeUntilNextWave > 0) {
                timeUntilNextWave--;

                await mod.Wait(1);
            } else {
                StartWave();
            }
        } else {
            if (zombiesAlive <= 0 && zombiesSpawned >= zombiesPerWave) {
                EndWave();
            }
            await mod.Wait(1);
        }
    }
}
async function UpdateLoop() {
    let iterations = 0
    while (gameStarted) {
        iterations++;
        if (iterations % 50 === 0) {
            console.log("UpdateLoop alive: iteration ", iterations);
        }
        // Monitor dictionary sizes
        monitorDictionarySizes();

        survivors.forEach(player => {
            if (mod.IsPlayerValid(player)) {
                UpdatePlayerWaveUI(player);
            }
        });

        await mod.Wait(0.1);
    }
}
async function ZombieTargetingLoop() {
    let iterations = 0;
    while (gameStarted) {
        iterations++;
        if (iterations % 10 === 0) {
            console.log("ZombieTargetingLoop alive: iteration ", iterations);
        }
        let loopStartTime = mod.GetMatchTimeElapsed();

        zombies = zombies.filter(z => mod.IsPlayerValid(z) && mod.GetSoldierState(z, mod.SoldierStateBool.IsAlive));

        let apiCalls = 0;

        zombies.forEach(zombie => {
            if (mod.IsPlayerValid(zombie) && mod.GetSoldierState(zombie, mod.SoldierStateBool.IsAlive)) {
                let zombiePos = mod.GetSoldierState(zombie, mod.SoldierStateVector.GetPosition);
                let nearestPlayer = FindNearestSurvivor(zombiePos);

                if (nearestPlayer && mod.IsPlayerValid(nearestPlayer)) {
                    try {
                        mod.AISetTarget(zombie, nearestPlayer);

                        let playerPos = mod.GetSoldierState(nearestPlayer, mod.SoldierStateVector.GetPosition);
                        mod.AIMoveToBehavior(zombie, playerPos);

                        apiCalls += 2;
                    } catch(e) {
                        console.log("Failed to set zombie target or movement");
                    }
                }
            }
        });

        let loopTime = mod.GetMatchTimeElapsed() - loopStartTime;

        if (loopTime > 0.4 || apiCalls > 50) {
            console.log(" ZombieTargetingLoop SLOW: ", loopTime.toFixed(3), "s for ", zombies.length, " zombies (", apiCalls, " API calls)");
        }

        await mod.Wait(0.5);
    }
}
function FindNearestSurvivor(position: mod.Vector): mod.Player | null {
    let nearestPlayer: mod.Player | null = null;
    let nearestDistance = 999999;

    survivors.forEach(player => {
        if (mod.IsPlayerValid(player) && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
            let playerPos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
            let distance = mod.DistanceBetween(position, playerPos);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPlayer = player;
            }
        }
    });

    return nearestPlayer;
}
function StartWave() {
    currentWave++;
    waveInProgress = true;
    zombiesSpawned = 0;
    zombiesAlive = 0;

    isSpecialWave = (currentWave % 5 === 0);

    zombiesPerWave = 5 + (currentWave - 1) * 3;

    if (isSpecialWave) {
        zombiesPerWave += 5;
    } else {
    }

    console.log("Starting Wave ", currentWave, " with ", zombiesPerWave, " zombies. Special: ", isSpecialWave);

    SpawnZombiesForWave();
}
async function SpawnZombiesForWave() {
    let availableSpawners = GetAvailableSpawners();

    if (availableSpawners.length === 0) {
        console.log("ERROR: No available spawners!");
        return;
    }

    // Initialize learning for any new spawners
    initializeSpawnerLearning(availableSpawners);

    while (zombiesSpawned < zombiesPerWave && waveInProgress) {
        // while (zombiesAlive >= 11) {
        //     await mod.Wait(0.5);
        // }
        let referencePlayer: mod.Player | null = null;

        for (let survivor of survivors) {
            if (mod.IsPlayerValid(survivor) && mod.GetSoldierState(survivor, mod.SoldierStateBool.IsAlive)) {
                referencePlayer = survivor;
                break;
            }
        }

        if (!referencePlayer || !mod.IsPlayerValid(referencePlayer)) {
            console.log("No valid players found for spawner selection");
            break;
        }

        let playerPos = mod.GetSoldierState(referencePlayer, mod.SoldierStateVector.GetPosition);
        if (!playerPos) {
            console.log("Could not get player position");
            break;
        }

        // USE LEARNING TO SELECT SPAWNER
        let selectedSpawnerId = selectSpawnerWithLearning(availableSpawners, playerPos);

        console.log("=== SPAWNING ZOMBIE ", zombiesSpawned + 1, "/", zombiesPerWave, " FROM SPAWNER ", selectedSpawnerId, " ===");

        try {
            let spawner = mod.GetSpawner(selectedSpawnerId);

            mod.SpawnAIFromAISpawner(
                spawner,
                mod.SoldierClass.Assault,
                mod.Message(mod.stringkeys.ID_M_WW_ZOMBIE_NAME),
                                     mod.GetTeam(1)
            );

            zombiesSpawned++;

            // Note: We'll track the zombie ID when OnSpawnerSpawned fires
        } catch(e) {
            console.log("Failed to spawn from spawner ", selectedSpawnerId, ": ", e);
        }

        let spawnDelay = Math.max(0.5, 2 - (currentWave * 0.1));
        await mod.Wait(spawnDelay);
    }
}
function EndWave() {
    waveInProgress = false;
    timeUntilNextWave = waveDelay;

    console.log("Wave ", currentWave, " Complete!");

    // LEARNING SUMMARY
    endLearningEpisode();


    survivors.forEach(player => {
        if (mod.IsPlayerValid(player) && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
            mod.Heal(player, 50);
            mod.Resupply(player, mod.ResupplyTypes.AmmoCrate);
        }
    });
}
export function OnPlayerJoinGame(player: mod.Player) {
    if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
        playerCount++;
        survivors.push(player);

        mod.SetTeam(player, mod.GetTeam(2));

        let playerId = mod.GetObjId(player);
        playerPoints.set(playerId, 500);

        console.log("Player joined. Total players: ", playerCount);
    }
}
export function OnPlayerLeaveGame(playerId: number) {
    playerCount = Math.max(0, playerCount - 1);

    survivors = survivors.filter(p => mod.IsPlayerValid(p) && mod.GetObjId(p) !== playerId);

    playerPoints.delete(playerId);
    delete playerPrimaryWugTier[playerId];
    delete playerSecondaryWugTier[playerId];
    delete playerMeleeWugTier[playerId];
    delete playerPrimaryWeapon[playerId];
    delete playerSecondaryWeapon[playerId];
    delete playerMeleeWeapon[playerId];
    delete m44LastShotTime[playerId];
    delete piercingInProgress[playerId];
    delete piercerUIActive[playerId];
    delete playerHasHealthPerk[playerId];
    delete playerHasSpeedPerk[playerId];
    delete playerHasDamagePerk[playerId];
    delete activeNotifications[playerId];
    delete playerNotificationQueues[playerId];
    delete notificationContainersCreated[playerId];
    console.log("Player left. Total players: ", playerCount);
}
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    let playerID = mod.GetObjId(eventPlayer);

    if (pendingZombies.has(playerID)) {
        pendingZombies.delete(playerID);
        ConfigureZombie(eventPlayer, isSpecialWave);
        return;
    }

    if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAISoldier)) {
        mod.SetTeam(eventPlayer, mod.GetTeam(2));

        // Remove ALL equipment first
        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.PrimaryWeapon);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.SecondaryWeapon);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.GadgetOne);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.GadgetTwo);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.Throwable);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.MeleeWeapon);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.ClassGadget);
        } catch(e) {}

        try {
            mod.RemoveEquipment(eventPlayer, mod.InventorySlots.MiscGadget);
        } catch(e) {}

        // Give only P18 and Combat Knife
        mod.AddEquipment(eventPlayer, mod.Weapons.Sidearm_P18, mod.InventorySlots.SecondaryWeapon);
        mod.AddEquipment(eventPlayer, mod.Gadgets.Melee_Combat_Knife, mod.InventorySlots.MeleeWeapon);

        console.log("Player deployed with P18 and Combat Knife only");
    }
}
export function OnSpawnerSpawned(eventPlayer: mod.Player, eventSpawner: mod.Spawner): void {
    let spawnerID = mod.GetObjId(eventSpawner);

    console.log("OnSpawnerSpawned triggered for spawner ID: ", spawnerID);

    let isZombieSpawner = (spawnerID >= ZOMBIE_SPAWNER_START_ID && spawnerID <= ZOMBIE_SPAWNER_END_ID);

    if (!isZombieSpawner) {
        for (let debrisIdStr in DEBRIS_SPAWNER_MAP) {
            let debrisId = Number(debrisIdStr);
            let debrisSpawners = DEBRIS_SPAWNER_MAP[debrisId].map((id: number) => id + 100);
            if (debrisSpawners.includes(spawnerID)) {
                isZombieSpawner = true;
                console.log("Spawner ", spawnerID, " found in debris map for debris ", debrisId);
                break;
            }
        }
    }

    if (isZombieSpawner) {
        console.log("Zombie spawned from spawner ", spawnerID, " - marking as pending");

        let playerID = mod.GetObjId(eventPlayer);
        pendingZombies.add(playerID);

        // TRACK FOR LEARNING
        trackZombieSpawn(playerID, spawnerID);
    } else {
        console.log("Spawner ", spawnerID, " is NOT a zombie spawner - ignoring");
    }
}
function ConfigureZombie(zombie: mod.Player, isSpecial: boolean) {
    console.log("Configuring zombie... Special: ", isSpecial);

    mod.SkipManDown(zombie, true);

    let zombieHealth = isSpecial ? 50 : CalculateZombieHealth(currentWave);
    mod.SetPlayerMaxHealth(zombie, zombieHealth);
    mod.Heal(zombie, zombieHealth);

    console.log("Zombie health set to: ", zombieHealth);

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.PrimaryWeapon);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.SecondaryWeapon);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.GadgetOne);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.GadgetTwo);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.Throwable);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.MeleeWeapon);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.ClassGadget);
    } catch(e) {}

    try {
        mod.RemoveEquipment(zombie, mod.InventorySlots.MiscGadget);
    } catch(e) {}

    mod.AddEquipment(zombie, mod.Gadgets.Misc_Defibrillator, mod.InventorySlots.GadgetOne);

    mod.ForceSwitchInventory(zombie, mod.InventorySlots.GadgetOne);

    mod.AIEnableShooting(zombie, true);
    mod.AIEnableTargeting(zombie, true);

    let zombieSpeed = GetZombieSpeed(currentWave, isSpecial);
    mod.AISetMoveSpeed(zombie, zombieSpeed);

    if (isSpecial) {
        mod.AISetStance(zombie, mod.Stance.Crouch);
    }

    console.log("Zombie speed set to: ", zombieSpeed);

    let zombiePos = mod.GetSoldierState(zombie, mod.SoldierStateVector.GetPosition);
    let nearestPlayer = FindNearestSurvivor(zombiePos);

    if (nearestPlayer && mod.IsPlayerValid(nearestPlayer)) {
        try {
            mod.AISetTarget(zombie, nearestPlayer);

            let playerPos = mod.GetSoldierState(nearestPlayer, mod.SoldierStateVector.GetPosition);
            mod.AIMoveToBehavior(zombie, playerPos);
        } catch(e) {
            console.log("Failed to set initial zombie target");
        }
    }

    zombies.push(zombie);
    zombiesAlive++;
    console.log("Zombie configured with defib in GadgetOne slot");
}
export function OnPlayerInteract(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint): void {
    let interactId = mod.GetObjId(eventInteractPoint);

    console.log("Player interacted with: ", interactId);

    if (interactId >= DEBRIS_INTERACT_START && interactId <= DEBRIS_INTERACT_END) {
        if (clearedDebris.has(interactId)) {
            console.log("Debris already cleared: ", interactId);
            return;
        }

        ClearDebris(interactId, eventPlayer);
    }

    if (interactId >= WALL_WEAPON_INTERACT_START && interactId <= WALL_WEAPON_INTERACT_END) {
        purchaseWallWeapon(interactId, eventPlayer);
    }

    if (interactId === SUPRISE_MECHANICS_INTERACT_ID) {
        useSupriseMechanics(eventPlayer);
    }

    if (interactId === WUG_INTERACT_ID) {
        useWepUpGrader(eventPlayer);
    }
    if (interactId === HEALTHPERK_INTERACT_ID) {
        let playerId = mod.GetObjId(eventPlayer);
        if (playerHasHealthPerk[playerId]) {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_PERK_ALREADY_OWNED),
                                           eventPlayer
            );
            return;
        }
        let playerPoints = GetPlayerPoints(eventPlayer);
        if (playerPoints < HEALTHPERK_COST) {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, HEALTHPERK_COST),
                                           eventPlayer
            );
            return;
        }
        AddPlayerPoints(eventPlayer, -HEALTHPERK_COST);
        playerHasHealthPerk[playerId] = true;
        let currentMaxHealth = 100;
        let newMaxHealth = Math.floor(currentMaxHealth * HEALTHPERK_HEALTH_MULTIPLIER);
        mod.SetPlayerMaxHealth(eventPlayer, newMaxHealth);
        mod.Heal(eventPlayer, newMaxHealth);
        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.ID_M_WW_PERK_HEALTHPERK_PURCHASED),
                                       eventPlayer
        );
        console.log("Player ", playerId, " purchased IronGuts (", newMaxHealth, " HP)");
    }
    if (interactId === SPEEDPERK_INTERACT_ID) {
        let playerId = mod.GetObjId(eventPlayer);
        if (playerHasSpeedPerk[playerId]) {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_PERK_ALREADY_OWNED),
                                           eventPlayer
            );
            return;
        }
        let playerPoints = GetPlayerPoints(eventPlayer);
        if (playerPoints < SPEEDPERK_COST) {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, SPEEDPERK_COST),
                                           eventPlayer
            );
            return;
        }
        AddPlayerPoints(eventPlayer, -SPEEDPERK_COST);
        playerHasSpeedPerk[playerId] = true;
        mod.SetPlayerMovementSpeedMultiplier(eventPlayer, SPEEDPERK_SPEED_MULTIPLIER);
        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.ID_M_WW_PERK_SPEEDPERK_PURCHASED),
                                       eventPlayer
        );
        console.log("Player ", playerId, " purchased speed-perk (", SPEEDPERK_SPEED_MULTIPLIER, "x speed)");
    }
    if (interactId === DAMAGEPERK_INTERACT_ID) {
        let playerId = mod.GetObjId(eventPlayer);
        if (playerHasDamagePerk[playerId]) {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_PERK_ALREADY_OWNED),
                                           eventPlayer
            );
            return;
        }
        let playerPoints = GetPlayerPoints(eventPlayer);
        if (playerPoints < DAMAGEPERK_COST) {
            mod.DisplayNotificationMessage(
                mod.Message(mod.stringkeys.ID_M_WW_NOT_ENOUGH_POINTS, DAMAGEPERK_COST),
                                           eventPlayer
            );
            return;
        }
        AddPlayerPoints(eventPlayer, -DAMAGEPERK_COST);
        playerHasDamagePerk[playerId] = true;

        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.ID_M_WW_PERK_DAMAGEPERK_PURCHASED),
                                       eventPlayer
        );
        console.log("Player ", playerId, " purchased damage perk");
    }
}
function monitorDictionarySizes(): void {
    let currentTime = mod.GetMatchTimeElapsed();

    if (currentTime - lastMonitorTime < MONITOR_INTERVAL) {
        return;
    }

    lastMonitorTime = currentTime;

    console.log("=== DICTIONARY SIZE MONITOR ===");
    console.log("Time: ", currentTime.toFixed(1), "s | Wave: ", currentWave);

    // Count damageTracking
    let damageTrackingSize = 0;
    for (let key in damageTracking) {
        damageTrackingSize++;
    }
    console.log("damageTracking: ", damageTrackingSize, " entries");

    // Count meleeKillTracking
    let meleeKillTrackingSize = 0;
    for (let key in meleeKillTracking) {
        meleeKillTrackingSize++;
    }
    console.log("meleeKillTracking: ", meleeKillTrackingSize, " entries");

    // Count activePowerUps
    let activePowerUpsSize = 0;
    for (let key in activePowerUps) {
        activePowerUpsSize++;
    }
    console.log("activePowerUps: ", activePowerUpsSize, " entries");

    // Count playerPrimaryWugTier
    let primaryWugSize = 0;
    for (let key in playerPrimaryWugTier) {
        primaryWugSize++;
    }
    console.log("playerPrimaryWugTier: ", primaryWugSize, " entries");

    // Count playerSecondaryWugTier
    let secondaryWugSize = 0;
    for (let key in playerSecondaryWugTier) {
        secondaryWugSize++;
    }
    console.log("playerSecondaryWugTier: ", secondaryWugSize, " entries");

    // Count playerMeleeWugTier
    let meleeWugSize = 0;
    for (let key in playerMeleeWugTier) {
        meleeWugSize++;
    }
    console.log("playerMeleeWugTier: ", meleeWugSize, " entries");

    // Count playerPrimaryWeapon
    let primaryWeaponSize = 0;
    for (let key in playerPrimaryWeapon) {
        primaryWeaponSize++;
    }
    console.log("playerPrimaryWeapon: ", primaryWeaponSize, " entries");

    // Count playerSecondaryWeapon
    let secondaryWeaponSize = 0;
    for (let key in playerSecondaryWeapon) {
        secondaryWeaponSize++;
    }
    console.log("playerSecondaryWeapon: ", secondaryWeaponSize, " entries");

    // Count playerMeleeWeapon
    let meleeWeaponSize = 0;
    for (let key in playerMeleeWeapon) {
        meleeWeaponSize++;
    }
    console.log("playerMeleeWeapon: ", meleeWeaponSize, " entries");

    // Count m44LastShotTime
    let m44ShotSize = 0;
    for (let key in m44LastShotTime) {
        m44ShotSize++;
    }
    console.log("m44LastShotTime: ", m44ShotSize, " entries");

    // Count piercingInProgress
    let piercingSize = 0;
    for (let key in piercingInProgress) {
        piercingSize++;
    }
    console.log("piercingInProgress: ", piercingSize, " entries");

    // Count piercerUIActive
    let piercerUISize = 0;
    for (let key in piercerUIActive) {
        piercerUISize++;
    }
    console.log("piercerUIActive: ", piercerUISize, " entries");

    // Count playerHasHealthPerk
    let healthperkSize = 0;
    for (let key in playerHasHealthPerk) {
        healthperkSize++;
    }
    console.log("playerHasHealthPerk: ", healthperkSize, " entries");

    // Count playerHasSpeedPerk
    let speedperkSize = 0;
    for (let key in playerHasSpeedPerk) {
        speedperkSize++;
    }
    console.log("playerHasSpeedPerk: ", speedperkSize, " entries");

    let damageperkSize = 0;
    for (let key in playerHasDamagePerk) {
        damageperkSize++;
    }
    console.log("playerHasDamagePerk: ", damageperkSize, " entries");

    // Count activeNotifications
    let activeNotifSize = 0;
    for (let key in activeNotifications) {
        activeNotifSize++;
    }
    console.log("activeNotifications: ", activeNotifSize, " entries");

    // Count playerNotificationQueues
    let notifQueueSize = 0;
    let totalNotifications = 0;
    for (let key in playerNotificationQueues) {
        notifQueueSize++;
        if (playerNotificationQueues[key]) {
            totalNotifications += playerNotificationQueues[key].length;
        }
    }
    console.log("playerNotificationQueues: ", notifQueueSize, " players, ", totalNotifications, " total notifications");

    // Count notificationContainersCreated
    let notifContainerSize = 0;
    for (let key in notificationContainersCreated) {
        notifContainerSize++;
    }
    console.log("notificationContainersCreated: ", notifContainerSize, " entries");

    // Maps
    console.log("playerPoints Map: ", playerPoints.size, " entries");
    console.log("spawnerPerformance Map: ", spawnerPerformance.size, " entries");
    console.log("zombieTrackingData Map: ", zombieTrackingData.size, " entries");
    console.log("playerUIs Map: ", playerUIs.size, " entries");

    // Sets
    console.log("clearedDebris Set: ", clearedDebris.size, " entries");
    console.log("pendingZombies Set: ", pendingZombies.size, " entries");
    console.log("insideDamageEvent Set: ", insideDamageEvent.size, " entries");

    // Arrays
    console.log("survivors array: ", survivors.length, " entries");
    console.log("zombies array: ", zombies.length, " entries");
    console.log("episodeRewards array: ", episodeRewards.length, " entries");

    // Memory pressure indicators
    let totalDictEntries = damageTrackingSize + meleeKillTrackingSize + activePowerUpsSize +
    primaryWugSize + secondaryWugSize + meleeWugSize +
    primaryWeaponSize + secondaryWeaponSize + meleeWeaponSize +
    m44ShotSize + piercingSize + piercerUISize +
    healthperkSize + speedperkSize + activeNotifSize +
    notifQueueSize + notifContainerSize;

    let totalMapEntries = playerPoints.size + spawnerPerformance.size +
    zombieTrackingData.size + playerUIs.size;

    let totalSetEntries = clearedDebris.size + pendingZombies.size + insideDamageEvent.size;

    let totalArrayEntries = survivors.length + zombies.length + episodeRewards.length;

    console.log("--- TOTALS ---");
    console.log("Total Dict Entries: ", totalDictEntries);
    console.log("Total Map Entries: ", totalMapEntries);
    console.log("Total Set Entries: ", totalSetEntries);
    console.log("Total Array Entries: ", totalArrayEntries);
    console.log("GRAND TOTAL: ", totalDictEntries + totalMapEntries + totalSetEntries + totalArrayEntries);

    // Warnings
    if (damageTrackingSize > 100) {
        console.log(" WARNING: damageTracking is getting large (", damageTrackingSize, ")");
    }
    if (zombieTrackingData.size > 100) {
        console.log(" WARNING: zombieTrackingData is getting large (", zombieTrackingData.size, ")");
    }
    if (activePowerUpsSize > 20) {
        console.log(" WARNING: activePowerUps is getting large (", activePowerUpsSize, ")");
    }
    if (pendingZombies.size > 50) {
        console.log(" WARNING: pendingZombies is getting large (", pendingZombies.size, ")");
    }
    if (totalNotifications > 50) {
        console.log(" WARNING: Total notifications is getting large (", totalNotifications, ")");
    }

    console.log("===============================");
}
export function OngoingGlobal(): void {
    let allPlayers = mod.AllPlayers();
    let playerCount = mod.CountOf(allPlayers);

    for (let i = 0; i < playerCount; i++) {
        let player = mod.ValueInArray(allPlayers, i) as mod.Player;
        if (!mod.IsPlayerValid(player)) continue;

        let isAI = safeIsPlayerAI(player);
        let currentTeam = mod.GetObjId(mod.GetTeam(player));

        if (isAI && currentTeam !== 1) {
            mod.SetTeam(player, mod.GetTeam(1));
            console.log("Forced AI player ", mod.GetObjId(player), " to Team 1");
        } else if (!isAI && currentTeam !== 2) {
            mod.SetTeam(player, mod.GetTeam(2));
            console.log("Forced human player ", mod.GetObjId(player), " to Team 2");
        }
    }
}
export function OngoingPlayer(player: mod.Player): void {
    if (safeIsPlayerAI(player)) return;

    let playerId = mod.GetObjId(player);
    if (playerId < 0) return;

    // Debug mode toggle - switch to knife to toggle (only if DEBUGGING is enabled)
    if (DEBUGGING) {
        let knifeActive = mod.IsInventorySlotActive(player, mod.InventorySlots.MeleeWeapon);
        let wasKnifeHeld = debugKnifeHeld[playerId] || false;

        if (knifeActive && !wasKnifeHeld) {
            // Just switched to knife - toggle debug mode
            debugMode = !debugMode;
            if (debugMode) {
                mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_DEBUG_ON), player);
            } else {
                mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.ID_M_WW_DEBUG_OFF), player);
            }
            console.log("Debug mode: ", debugMode);
        }
        debugKnifeHeld[playerId] = knifeActive;
    }

    // Update notification fade
    if (playerNotificationQueues[playerId]) {
        let queue = playerNotificationQueues[playerId];

        for (let i = 0; i < queue.length; i++) {
            let alpha = getNotificationAlpha(queue[i], i);
            let textWidget = mod.FindUIWidgetWithName("notif_text_" + playerId + "_" + i);

            if (textWidget) {
                mod.SetUITextAlpha(textWidget, alpha);
            }
        }
    }

    let playerPos = safeGetPlayerPosition(player);
    if (!playerPos || !safeIsPlayerAlive(player)) return;

    // Check for power-up pickup
    for (let worldIconIdStr in activePowerUps) {
        let powerUp = activePowerUps[worldIconIdStr];
        let distance = mod.DistanceBetween(playerPos, powerUp.position);

        if (distance < 2.0) {
            if (powerUp.type === "maxammo") {
                activateMaxAmmo();
            } else if (powerUp.type === "nuke") {
                activateNuke(player);
            }

            despawnPowerUp(parseInt(worldIconIdStr));
            break;
        }
    }
}
export function OnPlayerDamaged(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDamageType: mod.DamageType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    try {
        if (damageEventInProgress) {
            console.log("BLOCKED concurrent damage event");
            return;
        }
        damageEventInProgress = true;
        let victimIsAI = safeIsPlayerAI(eventPlayer);
        let attackerIsAI = safeIsPlayerAI(eventOtherPlayer);

        // Track damage FROM zombies TO players (for learning)
        if (attackerIsAI && !victimIsAI && mod.IsPlayerValid(eventOtherPlayer)) {
            let zombieId = mod.GetObjId(eventOtherPlayer);

            trackZombieDamage(zombieId, 35);
        }

        if (victimIsAI && mod.IsPlayerValid(eventOtherPlayer)) {
            let victimId = mod.GetObjId(eventPlayer);
            let attackerId = mod.GetObjId(eventOtherPlayer);

            if (insideDamageEvent.has(victimId)) {
                console.log("Already processing damage for zombie ", victimId, " - skipping nested event");
                return;
            }
            insideDamageEvent.add(victimId);

            try {
                let isHeadshot = mod.EventDamageTypeCompare(eventDamageType, mod.PlayerDamageTypes.Headshot);
                let isMelee = mod.EventDamageTypeCompare(eventDamageType, mod.PlayerDamageTypes.Melee);

                let currentHealth = safeGetPlayerHealth(eventPlayer);

                let actualDamage = 0;
                if (damageTracking[victimId] && damageTracking[victimId].lastHealth > 0) {
                    actualDamage = damageTracking[victimId].lastHealth - currentHealth;
                } else {
                    let maxHealth = isSpecialWave ? 50 : CalculateZombieHealth(currentWave);
                    actualDamage = maxHealth - currentHealth
                }

                if (actualDamage <= 0) {
                    damageTracking[victimId] = {
                        lastHealth: currentHealth,
                        lastAttacker: attackerId,
                        lastTime: mod.GetMatchTimeElapsed()
                    };
                    return;
                }

                console.log("ACTUAL damage dealt: ", actualDamage, " (zombie health: ", currentHealth, ")");

                // Sledgehammer bonus damage
                let sledgehammerWugTier = 0;
                if (isMelee && playerMeleeWugTier[attackerId] !== undefined && playerMeleeWugTier[attackerId] > 0) {
                    sledgehammerWugTier = playerMeleeWugTier[attackerId];

                    let sledgeSwingBonus = SLEDGEHAMMER_BASE_BONUS * sledgehammerWugTier;
                    let willKill = currentHealth <= sledgeSwingBonus;

                    console.log("Sledgehammer hit - current HP: ", currentHealth, ", bonus dmg: ", sledgeSwingBonus, ", WILL KILL: ", willKill);

                    if (willKill) {
                        meleeKillTracking[victimId] = {
                            killerId: attackerId,
                            wugTier: sledgehammerWugTier,
                            timestamp: mod.GetMatchTimeElapsed()
                        };
                        console.log("TRACKED AS SLEDGEHAMMER KILLING BLOW for victim ", victimId);
                    } else {
                        delete meleeKillTracking[victimId];
                    }

                    if (sledgeSwingBonus > 0 && actualDamage > 0) {
                        mod.DealDamage(eventPlayer, sledgeSwingBonus, eventOtherPlayer);
                        console.log("Sledgehammer WuG swing bonus: +", sledgeSwingBonus, " (tier ", sledgehammerWugTier, ")");
                    }
                } else {
                    if (meleeKillTracking[victimId]) {
                        let trackData = meleeKillTracking[victimId];
                        let timeSinceTrack = mod.GetMatchTimeElapsed() - trackData.timestamp;

                        if (trackData.killerId !== attackerId || timeSinceTrack > 0.1) {
                            console.log("Clearing sledgehammer tracking - killed by different attacker or too much time passed");
                            delete meleeKillTracking[victimId];
                        }
                    }
                }

                // Weapon-upper-Grader damage multiplier
                let wugMultiplier = 1;
                let wugTier = 0;
                let isM44 = false;

                if (mod.IsInventorySlotActive(eventOtherPlayer, mod.InventorySlots.SecondaryWeapon)) {
                    if (playerSecondaryWugTier[attackerId] !== undefined) {
                        wugTier = playerSecondaryWugTier[attackerId];
                    }
                    if (playerSecondaryWeapon[attackerId] === mod.Weapons.Sidearm_M44) {
                        isM44 = true;
                    }
                } else if (mod.IsInventorySlotActive(eventOtherPlayer, mod.InventorySlots.PrimaryWeapon)) {
                    if (playerPrimaryWugTier[attackerId] !== undefined) {
                        wugTier = playerPrimaryWugTier[attackerId];
                    }
                }

                wugMultiplier = getWugDamageMultiplier(wugTier);

                if (!isMelee && wugMultiplier > 1 && actualDamage > 0 && !playerHasDamagePerk[attackerId]) {
                    let additionalDamage = Math.floor(actualDamage * (wugMultiplier - 1));
                    mod.DealDamage(eventPlayer, additionalDamage, eventOtherPlayer);
                    console.log("WuG bonus damage: +", additionalDamage, " (multiplier: ", wugMultiplier, "x)");
                    currentHealth = safeGetPlayerHealth(eventPlayer);
                } else if (!isMelee && wugMultiplier > 1 && actualDamage > 0 && playerHasDamagePerk[attackerId]) {
                    let additionalDamage = Math.floor(actualDamage * (wugMultiplier - 1) * 2);
                    mod.DealDamage(eventPlayer, additionalDamage, eventOtherPlayer);
                    console.log("WuG + DT bonus damage: +", additionalDamage, " (multiplier: ", wugMultiplier * 2, "x)");
                    currentHealth = safeGetPlayerHealth(eventPlayer);
                } else if (!isMelee && actualDamage > 0 && playerHasDamagePerk[attackerId]) {
                    let additionalDamage = Math.floor(actualDamage * 2);
                    mod.DealDamage(eventPlayer, additionalDamage, eventOtherPlayer);
                    console.log("DT bonus damage: +", additionalDamage, " (multiplier: 2x)");
                    currentHealth = safeGetPlayerHealth(eventPlayer);
                }
                // M44 Explosion
                if (isM44 && wugTier >= 1) {
                    let currentTime = mod.GetMatchTimeElapsed();

                    if (currentTime - lastExplosionReset >= 1.0) {
                        activeExplosions = 0;
                        lastExplosionReset = currentTime;
                    }

                    if (activeExplosions >= MAX_EXPLOSIONS_PER_SECOND) {
                        console.log("M44 explosion skipped - hit max explosions per second limit");
                        damageTracking[victimId] = {
                            lastHealth: currentHealth,
                            lastAttacker: attackerId,
                            lastTime: mod.GetMatchTimeElapsed()
                        };
                        return;
                    }

                    activeExplosions++;

                    if (m44LastShotTime[attackerId] && (currentTime - m44LastShotTime[attackerId]) < M44_SHOT_COOLDOWN) {
                        console.log("M44 explosion skipped - same shot (penetration)");
                        damageTracking[victimId] = {
                            lastHealth: currentHealth,
                            lastAttacker: attackerId,
                            lastTime: mod.GetMatchTimeElapsed()
                        };
                        return;
                    }

                    let impactPos = safeGetPlayerPosition(eventPlayer);
                    if (!impactPos) return;

                    try {
                        let explosionVFX: mod.VFX = mod.SpawnObject(
                            mod.RuntimeSpawn_Common.FX_Grenade_Fragmentation_Detonation,
                            impactPos,
                            mod.CreateVector(0, 0, 0)
                        );

                        mod.SetVFXScale(explosionVFX, M44_EXPLOSION_RADIUS / 10);
                        mod.SetVFXColor(explosionVFX, mod.CreateVector(1, 0.5, 0));
                        mod.EnableVFX(explosionVFX, true);

                        console.log("Explosion VFX spawned successfully");
                    } catch (e) {
                        console.log("VFX error: ", e);
                    }

                    let explosionDamage = M44_EXPLOSION_BASE_DAMAGE * wugTier;

                    console.log("M44 EXPLOSION - Damage: ", explosionDamage, " (Tier ", wugTier, ")");

                    let allPlayers = mod.AllPlayers();
                    let playerCount = mod.CountOf(allPlayers);

                    for (let i = 0; i < playerCount; i++) {
                        let nearbyPlayer = mod.ValueInArray(allPlayers, i) as mod.Player;
                        if (!mod.IsPlayerValid(nearbyPlayer)) continue;

                        let nearbyPos = safeGetPlayerPosition(nearbyPlayer);
                        if (!nearbyPos) continue;

                        let distance = mod.DistanceBetween(impactPos, nearbyPos);

                        if (distance <= M44_EXPLOSION_RADIUS) {
                            let isNearbyAI = safeIsPlayerAI(nearbyPlayer);

                            if (isNearbyAI) {
                                mod.DealDamage(nearbyPlayer, explosionDamage, eventOtherPlayer);
                                console.log("M44 explosion hit zombie ", mod.GetObjId(nearbyPlayer), " for ", explosionDamage);
                            } else if (nearbyPlayer === eventOtherPlayer) {
                                mod.DealDamage(nearbyPlayer, M44_PLAYER_DAMAGE, eventOtherPlayer);
                                console.log("M44 explosion self-damage: ", M44_PLAYER_DAMAGE);

                                mod.DisplayNotificationMessage(
                                    mod.Message(mod.stringkeys.ID_M_WW_M44_SELF_DAMAGE),
                                                               eventOtherPlayer
                                );
                            }
                        }
                    }
                }

                damageTracking[victimId] = {
                    lastHealth: currentHealth,
                    lastAttacker: attackerId,
                    lastTime: mod.GetMatchTimeElapsed()
                };

                // Award points
                let victimTeam = mod.GetObjId(mod.GetTeam(eventPlayer));
                let attackerTeam = mod.GetObjId(mod.GetTeam(eventOtherPlayer));

                if (victimTeam === 1 && attackerTeam === 2) {
                    let pointsAwarded = 0;
                    if (isHeadshot) {
                        pointsAwarded = POINTS_HEADSHOT_HIT;
                        AddPlayerPoints(eventOtherPlayer, POINTS_HEADSHOT_HIT);
                    } else {
                        pointsAwarded = POINTS_BODY_HIT;
                        AddPlayerPoints(eventOtherPlayer, POINTS_BODY_HIT);
                    }

                    // Spawn floating points at zombie position
                    let zombiePos = safeGetPlayerPosition(eventPlayer);
                    if (zombiePos) {
                        spawnFloatingPoints(zombiePos, pointsAwarded, isHeadshot);
                    }
                }
            } finally {
                insideDamageEvent.delete(victimId);
                damageEventInProgress = false;
            }
        }
    } catch (e) {
        console.log("ERROR in OnPlayerDamaged: ", e);
    }
}
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    let teamID = mod.GetObjId(mod.GetTeam(eventPlayer));

    if (teamID === 1) {
        let victimId = mod.GetObjId(eventPlayer);
        recordZombieDeath(victimId);
        // Check for sledgehammer piercing
        let isSledgehammerKill = meleeKillTracking[victimId] !== undefined;
        let sledgehammerWugTier = 0;
        let realKillerId = mod.GetObjId(eventOtherPlayer);

        if (isSledgehammerKill) {
            let trackData = meleeKillTracking[victimId];
            sledgehammerWugTier = trackData.wugTier;
            realKillerId = trackData.killerId;
            console.log("Sledgehammer kill confirmed! Tier: ", sledgehammerWugTier, " Killer: ", realKillerId);
        }
        if (isSledgehammerKill && sledgehammerWugTier >= 1) {
            console.log("PIERCING MECHANIC ACTIVATED!");

            let victimPos = safeGetPlayerPosition(eventPlayer);

            // Find the actual killer player by ID
            let killer: mod.Player | undefined = undefined;
            let allPlayers = mod.AllPlayers();
            let totalPlayers = mod.CountOf(allPlayers);

            for (let i = 0; i < totalPlayers; i++) {
                let p = mod.ValueInArray(allPlayers, i) as mod.Player;
                if (mod.IsPlayerValid(p) && mod.GetObjId(p) === realKillerId) {
                    killer = p;
                    break;
                }
            }

            if (!killer || !mod.IsPlayerValid(killer)) {
                console.log("Could not find killer player for piercing");
                zombiesAlive = Math.max(0, zombiesAlive - 1);
                let playerID = mod.GetObjId(eventPlayer);
                zombies = zombies.filter(z => mod.GetObjId(z) !== playerID);
                delete damageTracking[victimId];
                delete meleeKillTracking[victimId];
                return;
            }

            // TypeScript now knows killer is definitely a Player
            let killerPos = safeGetPlayerPosition(killer);

            if (victimPos && killerPos) {
                let swingDirection = mod.DirectionTowards(killerPos, victimPos);

                let allPlayersForChain = mod.AllPlayers();
                let playerCount = mod.CountOf(allPlayersForChain);

                let chainTargets: ChainTarget[] = [];

                for (let i = 0; i < playerCount; i++) {
                    let potentialTarget = mod.ValueInArray(allPlayersForChain, i) as mod.Player;

                    if (!mod.IsPlayerValid(potentialTarget)) continue;
                    if (!safeIsPlayerAI(potentialTarget)) continue;
                    if (!safeIsPlayerAlive(potentialTarget)) continue;

                    let targetId = mod.GetObjId(potentialTarget);
                    if (targetId === victimId) continue;

                    let targetPos = safeGetPlayerPosition(potentialTarget);
                    if (!targetPos) continue;

                    let killerToTarget = mod.DirectionTowards(killerPos, targetPos);
                    let dotProduct = mod.DotProduct(swingDirection, killerToTarget);

                    let distanceFromKiller = mod.DistanceBetween(killerPos, targetPos);
                    let distanceFromVictim = mod.DistanceBetween(victimPos, targetPos);
                    let killerToVictimDistance = mod.DistanceBetween(killerPos, victimPos);

                    let isInCone = dotProduct > 0.7;
                    let isBehindVictim = distanceFromKiller >= killerToVictimDistance;
                    let isCloseToVictim = distanceFromVictim <= 5.0;
                    let isInRange = distanceFromKiller <= 15.0;

                    if (isInCone && isBehindVictim && isCloseToVictim && isInRange) {
                        chainTargets.push({player: potentialTarget, distance: distanceFromVictim});
                        console.log("Added zombie ", targetId, " to piercing chain");
                    }
                }

                chainTargets.sort((a, b) => a.distance - b.distance);

                console.log("Found ", chainTargets.length, " zombies to drill through");

                if (chainTargets.length > 0) {
                    piercingInProgress[realKillerId] = true;
                    executePiercingSequence(killer, chainTargets, sledgehammerWugTier);
                }
            }
        }

        zombiesAlive = Math.max(0, zombiesAlive - 1);
        console.log("Zombie killed. Remaining: ", zombiesAlive);

        if (mod.IsPlayerValid(eventOtherPlayer)) {
            let killerTeam = mod.GetObjId(mod.GetTeam(eventOtherPlayer));
            if (killerTeam === 2) {
                let isHeadshotKill = mod.EventDeathTypeCompare(eventDeathType, mod.PlayerDeathTypes.Headshot);
                let killPoints = 0;

                if (isHeadshotKill) {
                    killPoints = POINTS_HEADSHOT_KILL;
                    AddPlayerPoints(eventOtherPlayer, POINTS_HEADSHOT_KILL);
                    console.log("Headshot kill! +", POINTS_HEADSHOT_KILL, " points");
                } else {
                    killPoints = POINTS_KILL;
                    AddPlayerPoints(eventOtherPlayer, POINTS_KILL);
                    console.log("Kill! +", POINTS_KILL, " points");
                }

                // Spawn floating points for kill bonus
                let zombieDeathPos = safeGetPlayerPosition(eventPlayer);
                if (zombieDeathPos) {
                    spawnFloatingPoints(zombieDeathPos, killPoints, isHeadshotKill);

                    // Random powerup drop chance
                    if (Math.random() < POWERUP_DROP_CHANCE) {
                        spawnPowerUp(zombieDeathPos);
                        console.log("Powerup spawned from kill");
                    }

                    // Debug mode: force spawn powerup (in addition to random)
                    if (debugMode) {
                        spawnPowerUp(zombieDeathPos);
                        console.log("DEBUG: Forced powerup spawn");
                    }
                }
            }
        }

        let playerID = mod.GetObjId(eventPlayer);
        zombies = zombies.filter(z => mod.GetObjId(z) !== playerID);

        delete damageTracking[victimId];
        delete meleeKillTracking[victimId];
    }

    if (teamID === 2 && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAISoldier)) {
        if (mod.IsPlayerValid(eventOtherPlayer) && safeIsPlayerAI(eventOtherPlayer)) {
            let zombieId = mod.GetObjId(eventOtherPlayer);
            trackZombiePlayerKill(zombieId);
        }
        CheckGameOver();
    }
}
export function OnRevived(victim: mod.Player, reviver: mod.Player): void {
    if (!safeIsPlayerAI(victim) && mod.IsPlayerValid(reviver) && !safeIsPlayerAI(reviver)) {
        AddPlayerPoints(reviver, POINTS_PER_REVIVE);
        console.log("Revive! Awarded ", POINTS_PER_REVIVE, " points to reviver");
    }
}
function CheckGameOver() {
    let aliveSurvivors = 0;

    survivors.forEach(player => {
        if (mod.IsPlayerValid(player) && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
            aliveSurvivors++;
        }
    });

    if (aliveSurvivors === 0) {
        GameOver();
    }
}
async function GameOver() {
    gameStarted = false;

    mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.ID_M_WW_GAME_OVER, currentWave - 1));

    await mod.Wait(10);
    mod.EndGameMode(mod.GetTeam(2));
}
class WaveUI {
    player: mod.Player;
    playerId: number;

    waveContainer: mod.UIWidget | undefined = undefined;
    waveLabel: mod.UIWidget | undefined = undefined;
    waveNumber: mod.UIWidget | undefined = undefined;

    zombiesContainer: mod.UIWidget | undefined = undefined;
    zombiesCount: mod.UIWidget | undefined = undefined;
    zombiesLabel: mod.UIWidget | undefined = undefined;

    pointsContainer: mod.UIWidget | undefined = undefined;
    pointsCount: mod.UIWidget | undefined = undefined;
    pointsLabel: mod.UIWidget | undefined = undefined;

    bannerContainer: mod.UIWidget | undefined = undefined;
    bannerTitle: mod.UIWidget | undefined = undefined;
    bannerSubtitle: mod.UIWidget | undefined = undefined;

    constructor(player: mod.Player) {
        this.player = player;
        this.playerId = mod.GetObjId(player);
        this.create();
    }

    create() {
        // Element 1 - WAVE COUNTER
        mod.AddUIContainer(
            "wave_container_" + this.playerId,
            mod.CreateVector(913.13, 53.46, 0),
                           mod.CreateVector(93.74, 77, 0),
                           mod.UIAnchor.TopLeft,
                           mod.GetUIRoot(),
                           true,
                           0,
                           mod.CreateVector(0.0314, 0.0431, 0.0431),
                           1,
                           mod.UIBgFill.Blur,
                           this.player
        );
        this.waveContainer = mod.FindUIWidgetWithName("wave_container_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "wave_label_" + this.playerId,
            mod.CreateVector(20.87, 0, 0),
                      mod.CreateVector(52, 32, 0),
                      mod.UIAnchor.TopLeft,
                      this.waveContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.ID_M_WW_WAVE_LABEL),
                      16,
                      mod.CreateVector(0.8353, 0.9216, 0.9765),
                      1,
                      mod.UIAnchor.Center,
                      this.player
        );
        this.waveLabel = mod.FindUIWidgetWithName("wave_label_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "wave_number_" + this.playerId,
            mod.CreateVector(27, 28, 0),  // Adjusted X position since now relative to container
                      mod.CreateVector(36, 32, 0),
                      mod.UIAnchor.TopLeft,
                      this.waveContainer,  // Changed from this.waveLabel to this.waveContainer
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.wave_number, currentWave),
                      32,
                      mod.CreateVector(0.8353, 0.9216, 0.9765),
                      1,
                      mod.UIAnchor.Center,
                      this.player
        );
        this.waveNumber = mod.FindUIWidgetWithName("wave_number_" + this.playerId) as mod.UIWidget;

        // Element 2 - ZOMBIES COUNTER
        mod.AddUIContainer(
            "zombies_container_" + this.playerId,
            mod.CreateVector(718.75, 70.96, 0),
                           mod.CreateVector(184, 42, 0),
                           mod.UIAnchor.TopLeft,
                           mod.GetUIRoot(),
                           true,
                           0,
                           mod.CreateVector(0.251, 0.0941, 0.0667),
                           1,
                           mod.UIBgFill.Blur,
                           this.player
        );
        this.zombiesContainer = mod.FindUIWidgetWithName("zombies_container_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "zombies_label_" + this.playerId,
            mod.CreateVector(62, 4, 0),
                      mod.CreateVector(120, 32, 0),
                      mod.UIAnchor.TopLeft,
                      this.zombiesContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.ID_M_WW_ZOMBIES_LABEL),
                      24,
                      mod.CreateVector(1, 0.5137, 0.3804),
                      1,
                      mod.UIAnchor.Center,
                      this.player
        );
        this.zombiesLabel = mod.FindUIWidgetWithName("zombies_label_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "zombies_count_" + this.playerId,
            mod.CreateVector(4, 4, 0),
                      mod.CreateVector(57.55, 32, 0),
                      mod.UIAnchor.TopLeft,
                      this.zombiesContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.Zombie_Number, zombiesAlive),
                      24,
                      mod.CreateVector(1, 0.5137, 0.3804),
                      1,
                      mod.UIAnchor.CenterRight,
                      this.player
        );
        this.zombiesCount = mod.FindUIWidgetWithName("zombies_count_" + this.playerId) as mod.UIWidget;

        // Element 3 - POINTS COUNTER
        mod.AddUIContainer(
            "points_container_" + this.playerId,
            mod.CreateVector(1016.67, 70.96, 0),
                           mod.CreateVector(184, 42, 0),
                           mod.UIAnchor.TopLeft,
                           mod.GetUIRoot(),
                           true,
                           0,
                           mod.CreateVector(0.2784, 0.4471, 0.2118),
                           1,
                           mod.UIBgFill.Blur,
                           this.player
        );
        this.pointsContainer = mod.FindUIWidgetWithName("points_container_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "points_label_" + this.playerId,
            mod.CreateVector(72, 4, 0),
                      mod.CreateVector(120, 32, 0),
                      mod.UIAnchor.TopLeft,
                      this.pointsContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.ID_M_WW_POINTS_VALUE, GetPlayerPoints(this.player)),
                      24,
                      mod.CreateVector(0.6784, 0.9922, 0.5255),
                      1,
                      mod.UIAnchor.Center,
                      this.player
        );
        this.pointsLabel = mod.FindUIWidgetWithName("points_label_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "points_count_" + this.playerId,
            mod.CreateVector(0, 4, 0),
                      mod.CreateVector(80, 32, 0),
                      mod.UIAnchor.TopLeft,
                      this.pointsContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.Zombie_Number_Copy),
                      24,
                      mod.CreateVector(0.6784, 0.9922, 0.5255),
                      1,
                      mod.UIAnchor.CenterRight,
                      this.player
        );
        this.pointsCount = mod.FindUIWidgetWithName("points_count_" + this.playerId) as mod.UIWidget;

        // Element 4 - BANNER
        mod.AddUIContainer(
            "banner_container_" + this.playerId,
            mod.CreateVector(-17.73, 145.51, 0),
                           mod.CreateVector(1955.45, 120, 0),
                           mod.UIAnchor.TopLeft,
                           mod.GetUIRoot(),
                           false,
                           0,
                           mod.CreateVector(0.251, 0.0941, 0.0667),
                           1,
                           mod.UIBgFill.Blur,
                           this.player
        );
        this.bannerContainer = mod.FindUIWidgetWithName("banner_container_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "banner_title_" + this.playerId,
            mod.CreateVector(909.43, 0, 0),
                      mod.CreateVector(136.59, 50, 0),
                      mod.UIAnchor.TopLeft,
                      this.bannerContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.Text_MBVL4),
                      24,
                      mod.CreateVector(1, 0.5137, 0.3804),
                      1,
                      mod.UIAnchor.Center,
                      this.player
        );
        this.bannerTitle = mod.FindUIWidgetWithName("banner_title_" + this.playerId) as mod.UIWidget;

        mod.AddUIText(
            "banner_subtitle_" + this.playerId,
            mod.CreateVector(793.94, 51.05, 0),
                      mod.CreateVector(367.58, 50, 0),
                      mod.UIAnchor.TopLeft,
                      this.bannerContainer,
                      true,
                      0,
                      mod.CreateVector(0.2, 0.2, 0.2),
                      1,
                      mod.UIBgFill.None,
                      mod.Message(mod.stringkeys.Text_MBVL4_Copy, timeUntilNextWave),
                      56,
                      mod.CreateVector(1, 0.5137, 0.3804),
                      1,
                      mod.UIAnchor.Center,
                      this.player
        );
        this.bannerSubtitle = mod.FindUIWidgetWithName("banner_subtitle_" + this.playerId) as mod.UIWidget;
    }

    update() {

        if (this.waveNumber) {
            mod.SetUITextLabel(this.waveNumber, mod.Message(mod.stringkeys.wave_number, currentWave));
        } else {

        }

        if (this.zombiesCount) {
            mod.SetUITextLabel(this.zombiesCount, mod.Message(mod.stringkeys.Zombie_Number, zombiesAlive));
        }

        if (this.pointsLabel) {
            mod.SetUITextLabel(this.pointsLabel, mod.Message(mod.stringkeys.ID_M_WW_POINTS_VALUE, GetPlayerPoints(this.player)));
        }

        if (this.bannerContainer && this.bannerSubtitle) {
            if (!waveInProgress && timeUntilNextWave > 0) {
                mod.SetUIWidgetVisible(this.bannerContainer, true);
                mod.SetUITextLabel(this.bannerSubtitle, mod.Message(mod.stringkeys.Text_MBVL4_Copy, timeUntilNextWave));
            } else {
                mod.SetUIWidgetVisible(this.bannerContainer, false);
            }
        }
    }

    destroy() {
        if (this.waveContainer) mod.DeleteUIWidget(this.waveContainer);
        if (this.zombiesContainer) mod.DeleteUIWidget(this.zombiesContainer);
        if (this.pointsContainer) mod.DeleteUIWidget(this.pointsContainer);
        if (this.bannerContainer) mod.DeleteUIWidget(this.bannerContainer);
    }
}
let playerUIs: Map<number, WaveUI> = new Map();
function UpdatePlayerWaveUI(player: mod.Player) {
    let playerId = mod.GetObjId(player);

    if (!playerUIs.has(playerId)) {
        playerUIs.set(playerId, new WaveUI(player));
    }

    let ui = playerUIs.get(playerId);
    if (ui) {
        ui.update();
    }
}
