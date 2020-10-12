#!/usr/bin/env node

exports.leftpad = (num, len) => num.toFixed(0).padStart(len, ' ');
exports.groupByWeapon = (data) => Array.from(
  data.reduce((map, game) => {
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
    }, new Map())
);
