import curses
from socketIO_client import SocketIO

socket = SocketIO("http://seafour.club", 80)

# This starts curses. I hate curses.
screen = curses.initscr(); curses.noecho(); curses.cbreak(); screen.keypad(1)
curses.start_color(); curses.use_default_colors(); screen.clear()
sizeY,sizeX = screen.getmaxyx()

# Format for newwin is sizey, sizex, startposy, startposx
# Messages contains all messages.
messages = curses.newwin(curses.LINES, curses.COLS-32, 0,0)

# Message box contains message txt, for the sake of .box()
messageBox = curses.newwin(6,31,sizeY-6,sizeX-31)
messageBox.box()
messageTxt = curses.newwin(4,29,sizeY-5,sizeX-30)
message = ""

# These functions are socket listeners.
# The name prescribes the type of emit to listen for.
class listeners:
    def userMessage(*args):
        message = "Testing the userMessage listener"

# Sets all listeners.
for function in listeners.__dict__:
    socket.on(function, listeners.__dict__[function])

while True:
    messageTxt.addstr(0,0, message)

    screen    .refresh()
    messages  .refresh()
    messageBox.refresh()
    messageTxt.refresh()

    # Keypress handler.
    socket.wait_for_callbacks()
    char = screen.getkey()
    if char == "\n":
        socket.emit('userMessage', message)
        messageTxt.clear()
        message = ""
    elif char == "KEY_BACKSPACE":
        message = message[:-1]
        messageTxt.clear()
    else:
        message += char

# This kills curses. I hate curses.
screen.clear();curses.nocbreak();screen.keypad(0);curses.echo();curses.endwin()