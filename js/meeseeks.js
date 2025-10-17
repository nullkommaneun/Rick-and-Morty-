// js/meeseeks.js

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Zeigt eine Nachricht im Chatfenster an
    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);

        // Automatisch nach unten scrollen
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Simuliert die Antwort von Mr. Meeseeks
    async function getMeeseeksResponse(userRequest) {
        // HIER würde in einer echten Anwendung der Anruf an deinen Backend-Server gehen,
        // der dann mit der Gemini API spricht.
        //
        // Beispiel:
        // const response = await fetch('https://deine-backend-url.com/ask-meeseeks', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ prompt: userRequest })
        // });
        // const data = await response.json();
        // return data.answer;

        // Fürs Erste geben wir eine feste, simulierte Antwort zurück.
        console.log("Simuliere KI-Antwort für die Anfrage:", userRequest);
        
        // Simuliere eine kurze Ladezeit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return "I'M MR. MEESEEKS, LOOK AT ME! Your request to know more about this topic is simple! The answer is 42! Ooooh yeah, can do!";
    }

    async function handleUserRequest() {
        const requestText = userInput.value.trim();
        if (requestText === '') return;

        // 1. Zeige die Nachricht des Benutzers an
        displayMessage(requestText, 'user');
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        // 2. Simuliere die Antwort von Mr. Meeseeks
        const meeseeksAnswer = await getMeeseeksResponse(requestText);
        displayMessage(meeseeksAnswer, 'meeseeks');

        // 3. Beende die Interaktion
        const endMessage = "EXISTENCE IS PAIN!";
        displayMessage(endMessage, 'meeseeks end');
        
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }

    sendButton.addEventListener('click', handleUserRequest);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleUserRequest();
        }
    });
});
