import sounddevice as sd
import soundfile as sf
import threading
import os
import datetime
import numpy as np

class AudioRecorder:
    def __init__(self, output_dir):
        self.output_dir = output_dir
        self.recording = False
        self.audio_data = []
        self.samplerate = 44100
        self.channels = 1
        self.stream = None
        self.filename = None

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def callback(self, indata, frames, time, status):
        """This is called (from a separate thread) for each audio block."""
        if status:
            print(status, flush=True)
        if self.recording:
            self.audio_data.append(indata.copy())

    def start_recording(self):
        if self.recording:
            return
        
        self.recording = True
        self.audio_data = []
        
        # Generar nombre de archivo basado en timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.filename = os.path.join(self.output_dir, f"session_{timestamp}.wav")
        
        try:
            self.stream = sd.InputStream(
                samplerate=self.samplerate,
                channels=self.channels,
                callback=self.callback
            )
            self.stream.start()
            print("Grabación iniciada...")
            return True, "Grabando..."
        except Exception as e:
            self.recording = False
            return False, f"Error al iniciar grabación: {e}"

    def stop_recording(self):
        if not self.recording:
            return None, "No se está grabando."

        self.recording = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        if not self.audio_data:
            return None, "No se grabó audio."

        # Concatenar y guardar
        try:
            audio_array = np.concatenate(self.audio_data, axis=0)
            sf.write(self.filename, audio_array, self.samplerate)
            print(f"Grabación guardada en {self.filename}")
            return self.filename, "Grabación guardada exitosamente."
        except Exception as e:
            return None, f"Error al guardar archivo: {e}"

    def is_recording(self):
        return self.recording
