const http = require('http');
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

// HTTP-сервер для жизни на Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Jarvis bot is active!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server is running on port ${PORT}`);
});

const bot = mineflayer.createBot({
  host: 'UlquiorraLizun.aternos.me',
  port: 42793,
  username: 'Jarvis',
  version: '1.16.5',
  checkTimeoutInterval: 120000
});

bot.loadPlugin(pathfinder);

// Продвинутый перехватчик FML/Forge хендшейка для Arclight
bot._client.on('custom_payload', (packet) => {
  const channel = packet.channel;
  if (!channel) return;

  // Отвечаем на форджевские каналы хендшейка
  if (channel.startsWith('fml:') || channel.startsWith('forge:')) {
    try {
      // Отправляем пустой ACK или подтверждение пакета, чтобы сервер не кикал
      bot._client.write('custom_payload', {
        channel: channel,
        data: Buffer.from([0])
      });
    } catch (e) {}
  }
});

bot.once('spawn', () => {
  console.log('Джарвис успешно прорвал оборону Arclight и зашел на сервер!');
  bot.chat('Системы инициализированы. Облачный протокол активен, босс.');
  
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log(`[Чат] ${username}: ${message}`);

  const msg = message.toLowerCase();

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
