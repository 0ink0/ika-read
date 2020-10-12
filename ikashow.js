#!/usr/bin/env node
const stats = require('./lib/stats.js');

const Realm = require('realm');
const realm = new Realm({ path: 'stats.realm' });

const yargs = require('yargs');
const argv = yargs
  .command('list <key>', 'list options for a specific key.',
    (yargs) => {
      return yargs
        .positional('key', {
          choices: ['rule', 'weapon']
        });
    },
    (argv) => {
      const data = realm
        .objects('Result')
        .filtered('game.modeKey == "gachi"');
      switch (argv.key) {
        case 'rule':
          console.log(data
            .filtered(`                         \
              game.ruleKey <> null              \
              SORT(game.ruleKey ASC)            \
              DISTINCT(game.ruleKey)            \
            `)
            .map((result) => `${result.game.rule} (${result.game.ruleKey})`)
            .join('\n')
          );
          break;
        case 'weapon':
          console.log(data
            .filtered(`                         \
              player.weapon.ID <> null          \
              SORT(player.weapon.ID ASC)        \
              DISTINCT(player.weapon.ID)        \
            `)
            .map((result) => `${result.player.weapon.name} (${result.player.weapon.ID})`)
            .join('\n')
          );
          break;
      }
    },
  )
  .command('$0', 'default',
    (yargs) => {
      return yargs
        .option('rule', {
          type: 'string',
        })
        .option('weapon', {
          type: 'string',
        })
        .option('weapon-id', {
          alias: 'wid',
          type: 'number',
        });
    },
    (argv) => {
      console.log(argv);
    },
  )
  .help()
  .alias('help', 'h')
  .parse();

realm.close();
