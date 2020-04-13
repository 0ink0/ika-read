#!/usr/bin/env nodejs
const Realm = require('realm');
const realm = new Realm({ path: 'stats.realm' });
const data = realm
    .objects('Result')
    .filtered('game.modeKey == "gachi"')
    .filtered('game.ruleKey == "tower_control"')
    .filtered('udemaeName == "S+"')
    .sorted('no');

let fmt = (num, len) => num.toFixed(0).padStart(len, ' ');
let acc = (arr, game) => {
    let index = arr.length - 1;
    if ((game.player.udemaeName != 'S+') ||
        (game.player.sPlusNumber != game.sPlusNumber)) {
        arr.push({
            date: game.startTime,
            sPlusNumber: game.sPlusNumber,
            minPower: 9999,
            maxPower: 0,
            winCount: 0,
            lossCount: 0,
        });
        index -= 1;
    }
    if ((index >= 0) &&
        (game.player.udemaeName == 'S+')) {
        let stat = arr[index];
        stat.minPower = Math.min(stat.minPower, game.gachiEstimatePower);
        stat.maxPower = Math.max(stat.maxPower, game.gachiEstimatePower);
        stat.winCount += game.win ? 1 : 0;
        stat.lossCount += game.win ? 0 : 1;
    }
    return arr;
};
let accStages = (map, game) => {
    if (!map.has(game.player.weapon.name)) {
        map.set(game.player.weapon.name, new Map());
    }
    let wMap = map.get(game.player.weapon.name);
    if (!wMap.has(game.stage.name)) {
        wMap.set(game.stage.name, {
            winCount: 0,
            lossCount: 0,
        });
    }
    let stat = wMap.get(game.stage.name);
    stat.winCount += game.win ? 1 : 0;
    stat.lossCount += game.win ? 0 : 1;
    return map;
};

console.log(
    data
    .reduce(acc, [])
    .map(stat => {
        let count = stat.winCount + stat.lossCount;
        return [
            `${stat.date.toDateString()}`,
            `S+${stat.sPlusNumber}`,
            `min power: ${stat.minPower}`,
            `max power: ${stat.maxPower}`,
            `win rate: ${fmt(stat.winCount / count * 100, 3)}%`,
            `matches: ${fmt(count, 2)}`,
            ].join(', ');
    })
    .join('\n')
);

console.log(
    Array.from(data
        .reduce(accStages, new Map())
    )
    .map(([weapon, wMap]) => `\n* ${weapon}:\n` +
        Array.from(wMap).map(([stage, stat]) => {
            let count = stat.winCount + stat.lossCount;
            return [stage, stat.winCount / count * 100, count];
        })
        .sort((l, r) => (r[1] - l[1]))
        .map(([stage, winRate, count]) => {
            return [
                `${stage.padEnd(24, ' ')}`,
                `win rate: ${fmt(winRate, 3)}%`,
                `matches: ${fmt(count, 2)}`,
            ].join(', ');
        })
        .join('\n')
    )
    .join('\n')
);

realm.close();
