from flask import Flask, jsonify, request
import random
import string

################################
#Elsana's code
from transformers import pipeline
import numpy as np
p = pipeline("automatic-speech-recognition", model="openai/whisper-small.en")

transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-base.en")

def transcribe(audio):
    sr, y = audio
    y = y.astype(np.float32)
    y /= np.max(np.abs(y))

    return transcriber({"sampling_rate": sr, "raw": y})["text"]

# def regenerate(audio):
#     return transcribe(audio)

def predict(txt):
  top_50 = [1,2,3]
  top_50 = call_to_model(txt)
  return top_50

def call_to_model(txt):
  return [1,2,3]

def clear_audio():
    return None, ""

################################

app = Flask(__name__)

def generate_words(n, length=5):
    words = [''.join(random.choices(string.ascii_lowercase, k=length)) for _ in range(n)]
    return words

@app.route('/words', methods=['GET'])
def get_words():
    n = int(request.args.get('n', 1))
    n = max(1, min(n, 50))  # Ensure n is between 1 and 50
    words = generate_words(n)
    print(f"Generated words: {words}")
    return jsonify({'words': words})

if __name__ == '__main__':
    app.run(debug=True)

