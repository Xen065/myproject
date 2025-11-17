/**
 * Web-Android Communication Bridge
 *
 * This JavaScript file enables your web app to communicate with Android
 *
 * Add this to your HTML file, and you can call Android functions from JavaScript!
 */

// Check if running inside Android WebView
function isAndroid() {
    return typeof AndroidBridge !== 'undefined';
}

// Bridge API - Works both in browser and Android
const AppBridge = {
    // Save card to Android database
    saveCard: function(card) {
        if (isAndroid()) {
            AndroidBridge.saveCardToAndroid(JSON.stringify(card));
        } else {
            // Fallback to localStorage in browser
            let cards = JSON.parse(localStorage.getItem('edumaster_cards') || '[]');
            cards.push(card);
            localStorage.setItem('edumaster_cards', JSON.stringify(cards));
            console.log('Saved to localStorage (browser mode)');
        }
    },

    // Get cards from Android
    getCards: function() {
        if (isAndroid()) {
            const cardsJson = AndroidBridge.getAndroidCards();
            return JSON.parse(cardsJson);
        } else {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('edumaster_cards') || '[]');
        }
    },

    // Sync all data to Android
    syncToAndroid: function() {
        if (isAndroid()) {
            AndroidBridge.syncToAndroid();
            AndroidBridge.showToast('Syncing to Android...');
        } else {
            console.log('Sync only available in Android app');
            alert('This feature is only available in the Android app');
        }
    },

    // Show toast message
    showToast: function(message) {
        if (isAndroid()) {
            AndroidBridge.showToast(message);
        } else {
            // Fallback for browser
            console.log('Toast:', message);
            // You can use your existing showToast function here
        }
    },

    // Get user stats from Android
    getUserStats: function() {
        if (isAndroid()) {
            const statsJson = AndroidBridge.getUserStats();
            return JSON.parse(statsJson);
        } else {
            // Return from localStorage
            return {
                streak: parseInt(document.getElementById('streakCount')?.textContent || '0'),
                totalCards: parseInt(document.getElementById('totalCards')?.textContent || '0'),
                accuracy: parseInt(document.getElementById('todayGoal')?.textContent || '0'),
                level: parseInt(document.getElementById('userLevel')?.textContent || '0')
            };
        }
    }
};

// Receive card from Android (callback function)
window.receiveAndroidCard = function(card) {
    console.log('Received card from Android:', card);

    // Add to your cards array
    if (typeof cards !== 'undefined') {
        cards.push(card);
    }

    // Show notification
    showToast(`New card from Android: ${card.question.substring(0, 30)}...`);

    // Update UI
    updateStats();
};

// Show Android status badge
function showAndroidStatus() {
    const badge = document.createElement('div');
    badge.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #a4d96f, #3ddc84);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    badge.textContent = isAndroid() ? '🤖 Android Mode' : '🌐 Web Mode';
    document.body.appendChild(badge);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    showAndroidStatus();

    if (isAndroid()) {
        console.log('Running in Android WebView!');
        console.log('Bridge API available:', AppBridge);
    } else {
        console.log('Running in browser mode');
    }
});

// Export for use in your app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppBridge;
}
