/**
 * Local TTS service provider.
 */
 class LocalTTS {
     speaking:boolean
     synthesis:any
    constructor() {
        this.speaking = false;
        this.synthesis = window.speechSynthesis;
    }

    /**
     * Speak given text.
     *
     * @param {String} text text to pronounce
     * @param {String} language language of text
     * @param {String} speed "fast" or "slow"
     *
     * @returns {boolean} is speaking succeeded?
     */
    speak(text:string, language:string, speed:string) {
        // Check if the language is supported.
        if (!this.synthesis.getVoices().find((voice:any) => voice.lang.startsWith(language))) {
            // console.log(`No voice for language: "${language}"`);
            // return false;
        }

        this.speaking = true;
        let utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.94

        // Set speaking to false when finished speaking.
        utter.onend = (() => (this.speaking = false)).bind(this);

        this.synthesis.speak(utter);
        return true;
    }

    /**
     * Pause speaking.
     */
    pause() {
        if (this.speaking) {
            this.synthesis.cancel();
            this.speaking = false;
        }
    }
}

export default LocalTTS;