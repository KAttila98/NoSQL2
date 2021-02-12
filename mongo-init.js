db.auth('bilabor', 'bilabor')
db = db.getSiblingDB('bilabor')
db.rooms.insert({"name": "Secret room"})
db.messages.insert([{ "user" : "Lab instructor", "date" : new ISODate(), "content" : "Welcome to the General room!", "room" : "default", "avatarUrl" : "https://www.aut.bme.hu/Static/img/vik-logo.png"}, { "user" : "Lab instructor", "date" : new ISODate(), "content" : "Congratulations, you entered into the Secret room!", "room" : "Secret room", "avatarUrl" : "https://www.aut.bme.hu/Static/img/vik-logo.png" }])