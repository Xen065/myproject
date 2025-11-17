/**
 * Data Export/Import Module
 *
 * Allows users to transfer data between Web and Android apps offline
 *
 * Features:
 * 1. Export data as JSON file
 * 2. Import data from JSON file
 * 3. Generate QR code for quick sync
 * 4. Cloud backup support
 */

const DataSync = {
    // Export all app data as JSON
    exportData: function() {
        const exportData = {
            version: '1.0',
            exported: new Date().toISOString(),
            cards: JSON.parse(localStorage.getItem('edumaster_cards') || '[]'),
            sessions: JSON.parse(localStorage.getItem('edumaster_sessions') || '[]'),
            userStats: {
                streak: parseInt(document.getElementById('streakCount')?.textContent || '0'),
                totalCards: parseInt(document.getElementById('totalCards')?.textContent || '0'),
                accuracy: parseInt(document.getElementById('todayGoal')?.textContent || '0'),
                level: parseInt(document.getElementById('userLevel')?.textContent || '0')
            }
        };

        return JSON.stringify(exportData, null, 2);
    },

    // Download data as JSON file
    downloadAsFile: function() {
        const data = this.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `edumaster-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('✅ Data exported successfully!');
    },

    // Import data from JSON file
    importFromFile: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);

                    // Validate data
                    if (!importedData.version || !importedData.cards) {
                        throw new Error('Invalid backup file format');
                    }

                    // Merge or replace data
                    const shouldReplace = confirm(
                        `Import ${importedData.cards.length} cards?\n\n` +
                        `Current cards: ${cards.length}\n` +
                        `Click OK to merge, Cancel to replace`
                    );

                    if (shouldReplace) {
                        // Replace
                        localStorage.setItem('edumaster_cards', JSON.stringify(importedData.cards));
                        localStorage.setItem('edumaster_sessions', JSON.stringify(importedData.sessions || []));
                    } else {
                        // Merge
                        const existingCards = JSON.parse(localStorage.getItem('edumaster_cards') || '[]');
                        const merged = [...existingCards, ...importedData.cards];
                        localStorage.setItem('edumaster_cards', JSON.stringify(merged));
                    }

                    // Reload app
                    showToast('✅ Import successful! Reloading...');
                    setTimeout(() => window.location.reload(), 1000);

                } catch (error) {
                    alert('❌ Import failed: ' + error.message);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    },

    // Generate QR code for quick mobile sync
    generateQRCode: function() {
        const data = this.exportData();

        // Use a QR code library (e.g., qrcode.js)
        // For now, show base64 encoded data
        const encoded = btoa(data);
        const shortUrl = `edumaster://import?data=${encoded.substring(0, 100)}...`;

        showToast(`QR Code: ${shortUrl}`);
        alert('QR Code feature requires qrcode.js library.\nData size: ' + (data.length / 1024).toFixed(2) + ' KB');

        return shortUrl;
    },

    // Copy data to clipboard for manual transfer
    copyToClipboard: function() {
        const data = this.exportData();

        navigator.clipboard.writeText(data).then(() => {
            showToast('✅ Data copied to clipboard!');
            alert(
                'Data copied to clipboard!\n\n' +
                'You can now:\n' +
                '1. Paste it in a text editor\n' +
                '2. Send via messaging app\n' +
                '3. Save to cloud storage\n\n' +
                `Size: ${(data.length / 1024).toFixed(2)} KB`
            );
        }).catch(err => {
            console.error('Failed to copy:', err);
            showToast('❌ Failed to copy');
        });
    },

    // Import from clipboard
    importFromClipboard: function() {
        navigator.clipboard.readText().then(data => {
            try {
                const importedData = JSON.parse(data);

                if (!importedData.version || !importedData.cards) {
                    throw new Error('Invalid data format');
                }

                localStorage.setItem('edumaster_cards', JSON.stringify(importedData.cards));
                localStorage.setItem('edumaster_sessions', JSON.stringify(importedData.sessions || []));

                showToast('✅ Import successful! Reloading...');
                setTimeout(() => window.location.reload(), 1000);

            } catch (error) {
                alert('❌ Import failed: ' + error.message);
            }
        }).catch(err => {
            alert('❌ Failed to read clipboard: ' + err.message);
        });
    }
};

// Add export/import UI to your app
function addExportImportButtons() {
    // Create a floating menu button
    const menu = document.createElement('div');
    menu.style.cssText = `
        position: fixed;
        bottom: 150px;
        right: 20px;
        z-index: 1000;
    `;

    menu.innerHTML = `
        <button onclick="DataSync.downloadAsFile()" style="
            display: block;
            margin: 10px 0;
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        ">
            📥 Export Data
        </button>
        <button onclick="DataSync.importFromFile()" style="
            display: block;
            margin: 10px 0;
            padding: 12px 20px;
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        ">
            📤 Import Data
        </button>
        <button onclick="DataSync.copyToClipboard()" style="
            display: block;
            margin: 10px 0;
            padding: 12px 20px;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        ">
            📋 Copy
        </button>
    `;

    document.body.appendChild(menu);
}

// Auto-backup feature - backup every day
function enableAutoBackup() {
    const lastBackup = localStorage.getItem('last_backup');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!lastBackup || (now - parseInt(lastBackup)) > oneDayMs) {
        // Create automatic backup
        const data = DataSync.exportData();
        localStorage.setItem('auto_backup', data);
        localStorage.setItem('last_backup', now.toString());

        console.log('✅ Automatic backup created');
        showToast('✅ Daily backup created');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // You can call this to add export/import buttons
    // addExportImportButtons();

    // Enable auto-backup
    enableAutoBackup();
});

// Make it globally available
window.DataSync = DataSync;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSync;
}
