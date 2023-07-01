import threading
import time
from flask_socketio import SocketIO
from flask import Flask, render_template, request, current_app, Response
import assistant_new as am


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

connected_clients = {}

# Route for serving HTML
@app.route('/')
def index():
    return render_template('index.html')


# SocketIO event handler
@socketio.on('my event')
def handle_my_custom_event(text, methods=['GET', 'POST']):
    print('received my event: ' + str(text))
    am.getCommand(str(text))


# start Flask app
def start_flask_app():
    socketio.run(app ,)


# send text data to clients
def send_text(text):
    if text:
        socketio.emit('message', text)
        print("sent data : ", text)


# route : send text data
@app.route('/send_text', methods=['POST'])
def api_send_text():
    text_data = request.form['text_data']
    send_text(text_data)
    return 'Text data sent successfully'


# SSE endpoint for clients to receive text data
@app.route('/get_text')
def get_text():
    def generate_text():
        while True:
            text_data = ''
            yield f'data: {text_data}\n\n'

    return Response(generate_text(), mimetype='text/event-stream')

def start_assistant():
    am.launch_assistant()

def background():
    time.sleep(2)
    for i in range(5):
        time.sleep(2)
        send_text(f'This is text data {i}')


if __name__ == '__main__':
    # Create and start the send_text thread
    thread1 = threading.Thread(target=start_flask_app)
    # thread = threading.Thread(target=background)
    thread2 = threading.Thread(target=start_assistant)
    thread1.start()
    # thread.start()
    thread2.start()
    thread1.join()
    thread2.join()
