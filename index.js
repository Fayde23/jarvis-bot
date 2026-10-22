const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const bot = mineflayer.createBot({
  host: 'UlquiorraLizun.aternos.me', // твой адрес Aternos
  port: 42793,                        // твой порт
  username: 'Jarvis',
  version: '1.16.5',
  checkTimeoutInterval: 120000,
  brand: 'fml,forge'
});

bot.loadPlugin(pathfinder);

// Перехватываем FML2 / Forge хендшейк пакеты и подтверждаем их, чтобы Arclight не кикал
bot._client.on('custom_payload', (packet) => {
  if (packet.channel) {
    // Отвечаем на сетевые каналы Forge/FML корректным пустым или подтверждающим буфером
    if (packet.channel.startsWith('fml:') || packet.channel.startsWith('forge:')) {
      try {
        bot._client.write('custom_payload', {
          channel: packet.channel,
          data: Buffer.from([0]) // Ответ-подтверждение для протокола
        });
      } catch (e) {}
    }
  }
});

bot.once('spawn', () => {
  console.log('Джарвис успешно развернулся в облаке и зашел на сервер!');
  bot.chat('Системы инициализированы. Облачный протокол активен, босс.');
  
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log(`[Чат] ${username}: ${message}`);

  const msg = message.toLowerCase();

  // Базовые команды для теста
  if (msg.includes('джарвис, за мной')) {
    const player = bot.players[username]?.entity;
    if (!player) {
      bot.chat(`Не вижу вас, ${username}.`);
      return;
    }
    bot.chat(`Принято, иду за вами, ${username}.`);
    bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true);
  }

  if (msg.includes('джарвис стоять')) {
    bot.pathfinder.setGoal(null);
    bot.chat('Стою на месте.');
  }
});

bot.on('error', err => console.log('Ошибка бота:', err));
bot.on('kicked', reason => console.log('Бот отключен сервером:', reason));