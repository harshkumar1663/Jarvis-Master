from __future__ import with_statement
import pyttsx3
import speech_recognition as sr
import datetime
import wikipedia
import webbrowser
import os
import random
import cv2
import pywhatkit as kit
import sys
import pyautogui
import time
import operator
import requests
from new_server import send_text as say
import json
import time

# engine = pyttsx3.init('sapi5')
# voices = engine.getProperty('voices')
# engine.setProperty('voice', voices[0].id)
# engine.setProperty('rate', 170)
# engine.setProperty('pause',0.1)
text_data = 'Hello, Flask!'



def speak(text):
    global text_data
    text_data = text
    response = requests.post('http://localhost:5000/send_text', data={'text_data': text_data})
    time.sleep(1)
    # say(text)

def wishMe():


    hour = int(datetime.datetime.now().hour)
    if hour >= 0 and hour < 12:
        speak("Good Morning Sir")
    elif hour >= 12 and hour < 18:
        speak("Good Afternoon Sir")
    else:
        speak("Good Evening Sir")

    speak("Initializing systems. Please wait.")
    time.sleep(3)
    speak("All systems have been initialized successfully")
    speak("What can I do for you ?")


def takeCommand():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        r.pause_threshold = 0.5
        audio = r.listen(source)
    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language='en-in')
        print(f"User said: {query}\n")
    except Exception as e:
        print("Say that again please...")
        return "None"
    return query


def launch_assistant():
    webbrowser.open("http://127.0.0.1:5000/")
    time.sleep(1)
    pyautogui.hotkey("F11")
    wishMe()
    while True:
        query = takeCommand().lower()
        # query = input().lower()
        print("User said : ",query,"\n")
        
        # wikipedia
        if 'wikipedia' in query:
            speak('Searching Wikipedia...')
            query = query.replace("wikipedia", "")
            results = wikipedia.summary(query, sentences=2)
            speak("According to Wikipedia")
            print(results)
            speak(results)
        
        # youtube search
        elif 'search on youtube' in query:
            query = query.replace("search on youtube", "")
            webbrowser.open(f"www.youtube.com/results?search_query={query}")

        # open youtube and search 
        elif 'open youtube' in query:
            speak("what you will like to watch on youtube ?")
            qrry = takeCommand().lower()
            # qrry = input().lower()
            kit.playonyt(qrry)

        # close chrome
        elif 'close chrome' in query:
            os.system("taskkill /f /im chrome.exe")
            
        # close youtube
        elif 'close youtube' in query:
            import psutil
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                if proc.name() == "brave.exe" and any("youtube" in arg for arg in proc.cmdline()):
                    print(f"Process found: {proc.pid}")
                    proc.terminate()

            # import pyautogui
            # windows = pyautogui.getAllWindows()
            # print(windows)
            # time.sleep(1)
            # for window in windows:
            #     if 'YouTube' in window.title:
            #         print("Found")
            #         try:
            #             window.maximize()
            #         except:
            #             pass
            #         else:
            #             window.activate()
            #         time.sleep(0.5)
            #         pyautogui.hotkey('ctrl','w')
            #         break

            # os.system("taskkill /f /im brave.exe")
        
        # google search
        elif 'open google' in query:
            speak("what should I search ?")
            qry = takeCommand().lower()
            webbrowser.open(f"{qry}")
            results = wikipedia.summary(qry, sentences=2)
            speak(results)
        
        # close google (browser)
        elif 'close google' in query:
            os.system("taskkill /f /im brave.exe")
        
        # play music (spotify-web automation)
        # elif 'play music' in query:

        #  ask time
        elif 'the time' in query:
            strTime = datetime.datetime.now().strftime("%H:%M:%S")
            speak(f"Sir, the time is {strTime}")
        
        # shutdown the system
        elif "shut down the system" in query:
            os.system("shutdown /s /t 5")

        # restart the system
        elif "restart the system" in query:
            os.system("shutdown /r /t 5")

        # lock the system
        elif "Lock the system" in query:
            os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        
        # open notepad
        # elif "open notepad" in query:
        # npath = "C:\WINDOWS\system32\\notepad.exe"
        # os.startfile(npath)

        # close notepad
        elif "close notepad" in query:
            os.system("taskkill /f /im notepad.exe")

        # open CMD
        elif "open command prompt" in query:
            os.system("start cmd")

        # close CMD
        elif "close command prompt" in query:
            os.system("taskkill /f /im cmd.exe")

        # open webcam
        elif "open camera" in query:
            cap = cv2.VideoCapture(0)
            while True:
                ret, img = cap.read()
                cv2.imshow('webcam', img)
                k = cv2.waitKey(50)
                if k == 27:
                    break;
            cap.release()
            cv2.destroyAllWndows()
        
        # Model exit
        elif "go to sleep" in query:
            speak(' alright then, I am switching off')
            sys.exit()

        # system screenshot (will ask name for the file)
        elif "take screenshot" in query:
            speak('tell me a name for the file')
            name = takeCommand().lower()
            time.sleep(1.5)
            img = pyautogui.screenshot()
            img.save(f"{name}.png")
            speak("screenshot saved")


        # system volume up
        elif "volume up" in query:
            pyautogui.press("volumeup")
            pyautogui.press("volumeup")
            pyautogui.press("volumeup")
            pyautogui.press("volumeup")

        # system volume down
        elif "volume down" in query:
            pyautogui.press("volumedown")
            pyautogui.press("volumedown")
            pyautogui.press("volumedown")
            pyautogui.press("volumedown")
        
        # system mute
        elif "mute" in query:
            pyautogui.press("volumemute")
        
        # refresh system 
        elif "refresh" in query:
            pyautogui.hotkey("winleft","d")
            pyautogui.moveTo(1551, 551, 2)
            pyautogui.click(x=1551, y=551, clicks=1, interval=0, button='right')
            pyautogui.moveTo(1620, 667, 1)
            pyautogui.click(x=1620, y=667, clicks=1, interval=0, button='left')
        
        # scroll down
        elif "scroll down" in query:
            pyautogui.scroll(1000)
            
        # conversation : who are you
        elif "who are you" in query:
            speak('My Name Is Jarvis')
            speak('I can Do Everything that my creator programmed me to do')

        # conversation : who created you
        elif "who created you" in query:
            speak('I Do not Know His Name, I created with Python Language, in Visual Studio Code.')
        
        # open notepad (type function also implemented later on)
        elif "open notepad" in query:
            pyautogui.hotkey('win')
            time.sleep(1)
            pyautogui.write('notepad')
            time.sleep(1)
            pyautogui.press('enter')

        # type what the user says
        elif 'type' in query:  # 10
            query = query.replace("type", "")
            pyautogui.write(f"{query}")
