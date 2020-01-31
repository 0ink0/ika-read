#!/usr/bin/env nodejs
const Realm = require('realm');
const realm = new Realm({ path: 'stats.realm' });
const data = realm
    .objects('CoopResult')
    .filtered('jobID > 2809')
    .filtered('jobID <= 2848');

let bossScore = (id, kill, total) => {
    if (kill == 0)
        return 0;
    switch (id) {
        case 9:  // sakelien-cup-twins, Flyfish
        case 21: // sakerocket,         Drizzler
            return Math.max(0, 30 - (total - kill) * 10);
        case 14: // sakelien-tower,     Stinger
        case 6:  // sakelien-bomber,    Steelhead
        case 13: // sakelien-snake,     Steel Eel
            return Math.max(0, 20 - (total - kill) * 5);
        case 12: // sakelien-shield,    Scrapper
        case 15: // sakediver,          Maws
            return Math.max(0, 10 - (total - kill) * 5);
        case 3:  // sakelien-golden,    Goldie
        case 16: // sakedozer,          Griller
            break;
        default:
            console.log(`Unknown boss ID: ${id}`);
            break;
    }
    return 0;
};

let scores = data.map(job => {
    let score = job.waveDetails
        .map(wave => wave.goldenIkuraNum)
        .reduce((sum, v) => sum + v, 0);

    let bossKills = {};
    for (const boss of job.bossCounts)
        bossKills[boss.boss.id] = 0;

    let players = [job.myResult, ...job.otherResults];
    for (const player of players) {
        for (const boss of player.bossKillCounts)
            bossKills[boss.boss.id] += boss.count;
    }

    for (const boss of job.bossCounts)
        score += bossScore(boss.boss.id,
                           bossKills[boss.boss.id],
                           boss.count);
    return {
        id: job.jobID,
        score: score,
    };
});

console.log(scores);
console.log(`Best score: ${Math.max(...scores.map(s => s.score))}`);

realm.close();
