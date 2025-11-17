package com.edumaster.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import com.edumaster.data.models.Card
import com.edumaster.data.models.StudySession
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileReader
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.*

/**
 * Android Data Export/Import Utility
 *
 * Allows users to:
 * 1. Export data as JSON file
 * 2. Import data from JSON file
 * 3. Share data via any app (WhatsApp, Email, etc.)
 * 4. Backup to device storage
 */
class DataExportImport(private val context: Context) {

    private val gson = Gson()

    // Data model for export/import
    data class ExportData(
        @SerializedName("version") val version: String = "1.0",
        @SerializedName("exported") val exported: String = Date().toString(),
        @SerializedName("platform") val platform: String = "android",
        @SerializedName("cards") val cards: List<Card>,
        @SerializedName("sessions") val sessions: List<StudySession>?,
        @SerializedName("userStats") val userStats: UserStatsExport?
    )

    data class UserStatsExport(
        @SerializedName("streak") val streak: Int,
        @SerializedName("totalCards") val totalCards: Int,
        @SerializedName("accuracy") val accuracy: Int,
        @SerializedName("level") val level: Int
    )

    /**
     * Export all data to JSON file
     */
    suspend fun exportData(
        cards: List<Card>,
        sessions: List<StudySession>? = null,
        userStats: UserStatsExport? = null
    ): Result<File> = withContext(Dispatchers.IO) {
        try {
            val exportData = ExportData(
                cards = cards,
                sessions = sessions,
                userStats = userStats
            )

            val json = gson.toJson(exportData)

            // Create file in app's private storage
            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val file = File(context.filesDir, "edumaster_backup_$timestamp.json")

            FileWriter(file).use { writer ->
                writer.write(json)
            }

            Result.success(file)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Export and share via Intent (WhatsApp, Email, etc.)
     */
    suspend fun exportAndShare(
        cards: List<Card>,
        sessions: List<StudySession>? = null,
        userStats: UserStatsExport? = null
    ): Result<Unit> = withContext(Dispatchers.Main) {
        try {
            val fileResult = withContext(Dispatchers.IO) {
                exportData(cards, sessions, userStats)
            }

            fileResult.onSuccess { file ->
                // Get URI for sharing
                val uri = FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.provider",
                    file
                )

                // Create share intent
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/json"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_SUBJECT, "EduMaster Backup")
                    putExtra(Intent.EXTRA_TEXT, "EduMaster app data backup (${cards.size} cards)")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }

                val chooser = Intent.createChooser(shareIntent, "Share backup via...")
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(chooser)

                Toast.makeText(context, "✅ Backup created!", Toast.LENGTH_SHORT).show()
            }

            fileResult.onFailure { error ->
                Toast.makeText(context, "❌ Export failed: ${error.message}", Toast.LENGTH_SHORT).show()
            }

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Import data from JSON file
     */
    suspend fun importData(file: File): Result<ExportData> = withContext(Dispatchers.IO) {
        try {
            val json = FileReader(file).use { reader ->
                reader.readText()
            }

            val importedData = gson.fromJson(json, ExportData::class.java)

            // Validate
            if (importedData.version.isEmpty() || importedData.cards.isEmpty()) {
                throw Exception("Invalid backup file format")
            }

            Result.success(importedData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Import data from URI (from file picker or shared file)
     */
    suspend fun importDataFromUri(uri: Uri): Result<ExportData> = withContext(Dispatchers.IO) {
        try {
            val json = context.contentResolver.openInputStream(uri)?.use { inputStream ->
                inputStream.bufferedReader().use { it.readText() }
            } ?: throw Exception("Failed to read file")

            val importedData = gson.fromJson(json, ExportData::class.java)

            // Validate
            if (importedData.version.isEmpty() || importedData.cards.isEmpty()) {
                throw Exception("Invalid backup file format")
            }

            Result.success(importedData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Export to external storage (Downloads folder)
     */
    suspend fun exportToDownloads(
        cards: List<Card>,
        sessions: List<StudySession>? = null,
        userStats: UserStatsExport? = null
    ): Result<File> = withContext(Dispatchers.IO) {
        try {
            val exportData = ExportData(
                cards = cards,
                sessions = sessions,
                userStats = userStats
            )

            val json = gson.toJson(exportData)

            // Save to Downloads folder
            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val downloadsDir = context.getExternalFilesDir(null) // Or use Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = File(downloadsDir, "edumaster_backup_$timestamp.json")

            FileWriter(file).use { writer ->
                writer.write(json)
            }

            Toast.makeText(
                context,
                "✅ Saved to: ${file.absolutePath}",
                Toast.LENGTH_LONG
            ).show()

            Result.success(file)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get size of exported data
     */
    fun getExportSize(cards: List<Card>, sessions: List<StudySession>? = null): String {
        val exportData = ExportData(
            cards = cards,
            sessions = sessions,
            userStats = null
        )
        val json = gson.toJson(exportData)
        val sizeKB = json.length / 1024.0
        return String.format("%.2f KB", sizeKB)
    }
}

/**
 * Example usage in Fragment/Activity:
 *
 * // Export
 * lifecycleScope.launch {
 *     val exporter = DataExportImport(requireContext())
 *     val cards = repository.getAllCards()
 *
 *     exporter.exportAndShare(
 *         cards = cards,
 *         userStats = DataExportImport.UserStatsExport(
 *             streak = 7,
 *             totalCards = cards.size,
 *             accuracy = 85,
 *             level = 12
 *         )
 *     )
 * }
 *
 * // Import
 * lifecycleScope.launch {
 *     val importer = DataExportImport(requireContext())
 *     val result = importer.importDataFromUri(fileUri)
 *
 *     result.onSuccess { data ->
 *         // Save to database
 *         data.cards.forEach { card ->
 *             repository.insertCard(card)
 *         }
 *         Toast.makeText(context, "Imported ${data.cards.size} cards", Toast.LENGTH_SHORT).show()
 *     }
 *
 *     result.onFailure { error ->
 *         Toast.makeText(context, "Import failed: ${error.message}", Toast.LENGTH_SHORT).show()
 *     }
 * }
 */
