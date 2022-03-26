const chatService = require('./chat-service.js');
const _ = require('lodash');

const chatController = {};

// Inicializáljuk a beállításokat
let selectedRoom = 'default';
let myUsername = '';
let myAvatar = "assets/user.png";

// Bejelentkezéskor meghívódik és inicializálja a default szobát
chatController.login = function () {
  let usernameInput = document.getElementById('usernameInput');
  let avatarInput = document.getElementById('avatarInput');
  let serverInput = document.getElementById('serverInput');
  let passwordInput = document.getElementById('passwordInput');


  if (!_.isEmpty(avatarInput.value)){
        myAvatar = _.escape(avatarInput.value);
  }
  if (_.isEmpty(usernameInput.value) || _.isEmpty(serverInput.value)) {
    alert('Kérlek add meg az összes adatot!');
  } else {
    myUsername = _.escape(usernameInput.value);
    chatService.connect(usernameInput.value, avatarInput.value, serverInput.value, passwordInput.value, function () {
        //Sikeres csatlakozás esetén
        // Screen-t váltunk (szegényember SPA-ja)
        document.getElementById('login-window').style.display = 'none';
        document.getElementById('main-window').style.display = 'flex';

        // Kiírjuk a bejelentkezett felhasználó nevét
        document.getElementById('username').innerText = myUsername;
        chatController.refreshUsers();
        chatController.refreshRoom();
      },
      function (err) {
        alert("Nem sikerült csatlakozni az adatbázishoz: " + err)
      },
      // Új üzenet érkezett valahova (esemény a room_channel-ben)
      function (roomName) {
        if (roomName === selectedRoom) {
          chatController.refreshRoom();
        }
      },
      // Változott a felhasználók száma
      function () {
        chatController.refreshUsers();
      });
  }
};

// Megjelenít egy új üzenetet az üzenő területen
chatController.renderNewMessage = function (message) {
  // Megkeressük a DOM-ban a "messages" ID-val rendelkező üzenő területet, ami egy rendezetlen lista (<ul>).
  let messageArea = document.getElementById('messages');

  let avatarurl = message.avatarUrl
  if(message.avatarUrl == null || message.avatarUrl.length == 0){
      avatarurl = "assets/user.png"
  }
  
  // Kitöltünk és hozzáadunk egy új üzenetet a HTML sablon alapján
  messageArea.insertAdjacentHTML('beforeEnd',
    '<div class="media messages">' +
    '<img src=' +  _.escape(avatarurl) + ' width="40" height="40" class="mr-3 message-avatar">' +
    '<div class="media-body">' +
    '<h5 class="mt-0">' + _.escape(message.user) + '</h5>' + _.escape(message.content) +
    '</div>' +
    '</div>' +
    '<hr>'
  );

  // Lescrollozunk az üzenetek aljára
  document.getElementById('messages-panel').scrollTo(0, messageArea.scrollHeight);
};

// Megjelenít egy felhasználót a felhasználói területen
chatController.renderNewUser = function (user) {
  let userList = document.getElementById('user-list');
  let listedUser = _.escape(user);

  // Elnevezzük a két user közötti privát chatet jelző szobát, a sorrend fontos hogy kétirányú lehessen a kommunikáció
  let keys = _.orderBy([myUsername, listedUser]);
  let privateRoomName = keys[0] + '_' + keys[1];

  if (selectedRoom === privateRoomName) {
    // Ha már itt vagyunk nem kell linket készíteni.
    userList.insertAdjacentHTML('beforeEnd', '<li class="selector-panel-item selected"><b>' + listedUser + '</b></li>');
  } else {
    userList.insertAdjacentHTML('beforeEnd', '<li class="selector-panel-item" onclick="chatController.changeRoom(\'' + privateRoomName + '\')">' + listedUser + '</li>');
  }
};

// Új üzenetet küldünk a felhasználónkkal
chatController.sendMessage = function () {
  let textInput = document.getElementById('new-message-text');
  if (!_.isEmpty(textInput.value)) {
    let message = {
      user: myUsername,
      content: textInput.value,
      date: new Date(),
      avatarUrl: myAvatar
    };
    chatController.renderNewMessage(message);
    chatService.sendMessage(selectedRoom, message);
  }
  textInput.value = '';
};

// Ha megváltoztatjuk a szobát
chatController.changeRoom = function (roomName) {
  selectedRoom = roomName;
  chatController.refreshRoom();
  chatController.refreshUsers();
};

// Frissítjük a szoba üzeneteinek tartalmát
chatController.refreshRoom = function () {
  document.getElementById('messages').innerHTML = '';
  // Betöltjük az üzeneteket
  chatService.getMessages(selectedRoom, function (messages) {
    _.forEach(messages, function (message) {
      chatController.renderNewMessage(message);
    })
  });
};

// Frissítjük a felhasználói lista tartalmát
chatController.refreshUsers = function () {
  document.getElementById('user-list').innerHTML = '';
  // Betöltjük a felhasználókat (magunkat nem írjuk ki)
  chatService.getUsers(function (users) {
    _.forEach(users, function (user) {
      if (myUsername !== user) {
        chatController.renderNewUser(user);
      }
    });
  });
};

module.exports = chatController;