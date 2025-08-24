// המתן עד שכל הדף ייטען לפני הרצת הקוד
document.addEventListener('DOMContentLoaded', () => {

    const scannerApp = {
        // שמירת כל האלמנטים החשובים מהדף
        elements: {
            startButton: document.getElementById('startButton'),
            stopButton: document.getElementById('stopButton'),
            sessionNameInput: document.getElementById('sessionName'),
            resultDiv: document.getElementById('result'),
            readerDiv: document.getElementById('reader'),
            laser: document.querySelector('.scan-laser')
        },
        
        html5QrCode: null,

        // מתודה ראשית: מאתחלת את כל האירועים
        init() {
            this.elements.startButton.addEventListener('click', () => this.startScan());
            this.elements.stopButton.addEventListener('click', () => this.stopScan());
        },

        // מתודה להתחלת הסריקה
        startScan() {
            const sessionName = this.elements.sessionNameInput.value.trim();
            if (!sessionName) {
                alert('יש להזין שם מפגש לפני שמתחילים לסרוק.');
                return;
            }

            this.toggleUI(true); // עדכון הממשק למצב סריקה
            this.html5QrCode = new Html5Qrcode("reader");

            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 } 
            };
            
            this.html5QrCode.start(
                { facingMode: "environment" }, // בקשה למצלמה האחורית
                config, 
                (decodedText, decodedResult) => this.onScanSuccess(decodedText),
                (errorMessage) => {} // מתעלמים משגיאות רגעיות כדי שהסורק ימשיך לרוץ
            ).catch(err => {
                console.error("Camera start error:", err);
                this.elements.resultDiv.textContent = 'שגיאה בהפעלת המצלמה. יש לאשר הרשאות.';
                this.toggleUI(false); // החזרת הממשק למצב רגיל
            });
        },
        
        // מתודה לעצירת הסריקה
        stopScan() {
            if (this.html5QrCode && this.html5QrCode.isScanning) {
                this.html5QrCode.stop()
                    .then(() => {
                        this.toggleUI(false);
                        this.elements.resultDiv.textContent = 'הסריקה הופסקה.';
                    })
                    .catch(err => console.error("Scanner stop error:", err));
            }
        },

        // מתודה שפועלת כאשר סריקה מצליחה
        onScanSuccess(decodedText) {
            const sessionName = this.elements.sessionNameInput.value.trim();
            const finalUrl = decodedText + "&session=" + encodeURIComponent(sessionName);

            this.elements.resultDiv.textContent = 'מעבד...';
            
            fetch(finalUrl)
                .then(response => response.text())
                .then(text => {
                    this.elements.resultDiv.textContent = text;
                    if (navigator.vibrate) navigator.vibrate(100); // רטט קטן בטלפון כפידבק
                    
                    setTimeout(() => {
                        if (this.elements.resultDiv.textContent === text) {
                            this.elements.resultDiv.textContent = 'מוכן לסריקה הבאה...';
                        }
                    }, 2500);
                })
                .catch(err => {
                    this.elements.resultDiv.textContent = 'שגיאת רשת.';
                    console.error("Fetch error:", err);
                });
        },

        // מתודה לעדכון ממשק המשתמש בין המצבים
        toggleUI(isScanning) {
            this.elements.sessionNameInput.disabled = isScanning;
            this.elements.startButton.classList.toggle('hidden', isScanning);
            this.elements.stopButton.classList.toggle('hidden', !isScanning);
            this.elements.laser.style.display = isScanning ? 'block' : 'none';
            this.elements.readerDiv.style.display = isScanning ? 'block' : 'none';
        }
    };

    // הפעלת האפליקציה
    scannerApp.init();
});
