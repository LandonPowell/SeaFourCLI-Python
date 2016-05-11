var blessed = require('blessed');
//var socket  = require('socket.io-client')('https://seafour.club/');
var socket  = require('socket.io-client')('http://52.37.212.4');
/* Creates the 'screen' object. */
var screen = blessed.screen({
    smartCSR:   true,
    cursor:     {
        artificial: true,
        blink:      true,
        shape:      'underline'
    }
});

/* Holds the end-user's input. */
var inputBox = blessed.textarea({

    inputOnFocus:true,

    right:      1,
    bottom:     1,
    width:      '30%',
    height:     '20%',
    tags:       true,
    border:     { type: 'line' },
    style:      {
        fg:     'white',
        border: { fg: 'magenta' }
    }
});
inputBox.enableDrag();
screen.append(inputBox);

/* Holds other user's messages. */
var messages = blessed.log({
    top:            1,
    left:           1,
    bottom:         1,
    width:          '67%',
    scrollOnInput:  true,
    tags:           true,
    border:         { type: 'line' },
    style:      {
        fg:     'white',
        border: { fg: 'magenta' }
    }
});
screen.append(messages);

/* Holds system messages. */
var systemMessages = blessed.log({
    top:            1,
    right:          1,
    width:          '30%',
    height:         '75%',
    scrollOnInput:  true,
    tags:           true,
    border:         { type: 'line' },
    style:      {
        fg:     'white',
        border: { fg: 'magenta' }
    }
});
screen.append(systemMessages);

screen.render();

/* - SOCKET LISTENERS - */

socket.on('userMessage', function(nick, post, id, flair) {
    messages.add("{magenta-fg}" + nick + "{/} : " + post);
});
socket.on('systemMessage', function(text) {
    systemMessages.add("{yellow-fg}" + text + "{/}");
});

socket.on('topic', function(topic) {
    if(topic.length > 14) inputBox.setLabel( topic.substr(0,14)+"…" );
    else inputBox.setLabel( topic );
    screen.title = topic;
});

/* - KEYPRESS LISTENERS - */

/* Listens for enters. */
inputBox.key('enter', function(ch, key) {
    inputMessage = this.getValue().substring(0, this.getValue().length -1);

    if ( inputMessage[0] == "." ) { /* Commands start with a period. */
        var command = inputMessage.split(" ");

        switch(command[0]) {
            case ".login":
                socket.emit("login", command[1], command[2]);
                break;
            case ".nick":
                socket.emit("changeNick", inputMessage.substring(6));
                break;
            case ".roleChange":
                socket.emit("roleChange", command[1], command[2]);
                break;
            case ".kill":
                return process.exit(0);
                break;
            default:
                socket.emit(command[0].substr(1),
                            inputMessage.substring(command[0].length+1));
        }
    }
    else { /* Send any message that isn't a command. */
        socket.emit('userMessage', inputMessage);
    }

    this.clearValue();
});

/* This kills the Process. */
inputBox.key(['escape', 'C-c'], function(ch, key) {
    return process.exit(0);
});