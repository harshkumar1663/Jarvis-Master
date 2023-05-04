from flask import Flask, render_template, request, current_app
from flask_socketio import SocketIO, emit, send
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

connected_clients = {}

# Route for serving HTML
@app.route('/')
def index():
    return render_template('new.html')



@socketio.on('my event')
def handle_my_custom_event(text, methods=['GET', 'POST']):
    print('received my event: ' + str(text))
    send_message("how may i help you")



def send_message(message1, methods=['GET', 'POST']):
    # socketio.emit('my response', message1,broadcast=True)
    # with current_app.app_context():
    socketio.emit('message',message1)
    print("sent data ", message1)


def start_flask_app():
    socketio.run(app)

def start_assistant():
    # import assistant_main as am
    # am.launch_assistant()
    import send_numbers
if __name__ == '__main__':
    thread1 = threading.Thread(target=start_flask_app)
    thread2 = threading.Thread(target=start_assistant)
    thread1.start()
    thread2.start()
    thread1.join()
    thread2.join()
