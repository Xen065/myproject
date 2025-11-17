/**
 * Web App API Client
 *
 * Use this to connect your web app to the backend server
 *
 * Usage in your HTML:
 * <script src="web-api-client.js"></script>
 * <script>
 *   EduMasterAPI.getCards().then(cards => console.log(cards));
 * </script>
 */

const EduMasterAPI = {
    baseURL: 'http://localhost:3000/api',
    userId: 1, // You can get this from login

    // Helper function for API calls
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Get all cards
    async getCards() {
        return this.request(`/cards?userId=${this.userId}`);
    },

    // Create new card
    async createCard(question, answer, hint = '', category = 'general') {
        return this.request('/cards', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                question,
                answer,
                hint,
                category
            })
        });
    },

    // Update card (for spaced repetition)
    async updateCard(cardId, interval, easeFactor, nextReview) {
        return this.request(`/cards/${cardId}`, {
            method: 'PUT',
            body: JSON.stringify({
                interval,
                easeFactor,
                nextReview
            })
        });
    },

    // Get user stats
    async getUserStats() {
        return this.request(`/users/${this.userId}`);
    },

    // Sync all local data to server
    async syncToServer() {
        const localCards = JSON.parse(localStorage.getItem('edumaster_cards') || '[]');
        const localSessions = JSON.parse(localStorage.getItem('edumaster_sessions') || '[]');

        return this.request('/sync', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                cards: localCards,
                sessions: localSessions
            })
        });
    },

    // Get all courses
    async getCourses() {
        return this.request('/courses');
    },

    // Get study sessions
    async getSessions() {
        return this.request(`/sessions?userId=${this.userId}`);
    }
};

// Auto-sync feature - sync every 5 minutes
let autoSyncEnabled = false;

function enableAutoSync() {
    if (autoSyncEnabled) return;

    autoSyncEnabled = true;
    console.log('✅ Auto-sync enabled');

    setInterval(async () => {
        try {
            console.log('🔄 Auto-syncing...');
            await EduMasterAPI.syncToServer();
            console.log('✅ Auto-sync complete');
        } catch (error) {
            console.error('❌ Auto-sync failed:', error);
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Example: Enhanced rateCard function with server sync
async function rateCardWithSync(rating) {
    const card = cards[currentCardIndex];

    // Apply spaced repetition algorithm (same as before)
    if (rating < 3) {
        card.interval = 1;
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    } else {
        if (card.interval === 1) {
            card.interval = 6;
        } else {
            card.interval = Math.round(card.interval * card.easeFactor);
        }
        card.easeFactor = Math.min(2.5, card.easeFactor + (rating - 3) * 0.1);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + card.interval);
    card.nextReview = nextReview;

    // Save locally
    saveData();

    // Sync to server
    try {
        if (card.id) {
            await EduMasterAPI.updateCard(
                card.id,
                card.interval,
                card.easeFactor,
                nextReview.toISOString()
            );
            console.log('✅ Card synced to server');
        }
    } catch (error) {
        console.error('Failed to sync card:', error);
        showToast('⚠️ Offline mode - will sync later');
    }

    // Move to next card
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    loadCard(currentCardIndex);
    updateStats();
    showToast(`Next review in ${card.interval} days`);
}

// Example: Load cards from server
async function loadCardsFromServer() {
    try {
        showToast('🔄 Loading from server...');
        const response = await EduMasterAPI.getCards();

        if (response.success && response.cards.length > 0) {
            // Merge with local cards
            cards = response.cards;
            localStorage.setItem('edumaster_cards', JSON.stringify(cards));

            showToast(`✅ Loaded ${cards.length} cards from server`);
            updateStats();
        }
    } catch (error) {
        console.error('Failed to load from server:', error);
        showToast('⚠️ Using offline data');
    }
}

// Export for use in your app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EduMasterAPI;
}
