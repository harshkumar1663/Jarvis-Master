import new_server as s
import time

def send():
    for i in range(5):
        time.sleep(2)
        s.send_message(str(i))