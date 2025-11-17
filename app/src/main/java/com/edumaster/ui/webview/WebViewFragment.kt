package com.edumaster.ui.webview

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.edumaster.MainActivity
import com.edumaster.data.models.Card
import com.edumaster.data.models.Course
import com.edumaster.data.models.StudySession
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Date

/**
 * WebViewFragment - Embeds the web app inside Android with full communication bridge
 *
 * This demonstrates how to:
 * 1. Load a web app inside Android
 * 2. Enable two-way communication (Android <-> JavaScript)
 * 3. Share data between native Android and web interface
 */
class WebViewFragment : Fragment() {

    private lateinit var webView: WebView
    private val gson = Gson()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        webView = WebView(requireContext()).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
            }

            // Add JavaScript interface to communicate with Android
            addJavascriptInterface(
                AndroidBridge(this@WebViewFragment),
                "AndroidBridge"
            )

            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()

            // Load the web app - you can use either:
            // 1. Local file from assets
            loadUrl("file:///android_asset/web/educational-app-with-calendar.html")

            // 2. Or remote URL (if you host it online)
            // loadUrl("https://your-domain.com/educational-app.html")
        }

        return webView
    }

    /**
     * JavaScript Bridge - Allows web app to call Android functions
     *
     * Usage from JavaScript:
     * AndroidBridge.saveCardToAndroid('{"question": "test", "answer": "test"}')
     */
    class AndroidBridge(private val fragment: WebViewFragment) {

        @JavascriptInterface
        fun showToast(message: String) {
            fragment.requireActivity().runOnUiThread {
                Toast.makeText(fragment.requireContext(), message, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun saveCardToAndroid(cardJson: String) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val cardData = fragment.gson.fromJson(cardJson, WebCard::class.java)
                    val repository = (fragment.requireActivity() as MainActivity).getRepository()

                    val card = Card(
                        question = cardData.question,
                        answer = cardData.answer,
                        hint = cardData.hint ?: "",
                        courseId = 1L,
                        interval = cardData.interval ?: 1,
                        easeFactor = cardData.easeFactor ?: 2.5,
                        nextReview = Date(cardData.nextReview ?: System.currentTimeMillis())
                    )

                    repository.insertCard(card)

                    withContext(Dispatchers.Main) {
                        fragment.showToast("Card saved to Android database!")
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        fragment.showToast("Error saving card: ${e.message}")
                    }
                }
            }
        }

        @JavascriptInterface
        fun getAndroidCards(callback: String): String {
            // Return cards as JSON to web app
            val repository = (fragment.activity as? MainActivity)?.getRepository()
            // Simplified - in real app, use coroutines properly
            return """[
                {"question": "From Android: What is Kotlin?", "answer": "A modern programming language"},
                {"question": "From Android: What is WebView?", "answer": "A component to display web content"}
            ]"""
        }

        @JavascriptInterface
        fun syncToAndroid() {
            fragment.requireActivity().runOnUiThread {
                // Call JavaScript function to get all web data
                fragment.webView.evaluateJavascript(
                    """
                    (function() {
                        return JSON.stringify({
                            cards: localStorage.getItem('edumaster_cards'),
                            sessions: localStorage.getItem('edumaster_sessions')
                        });
                    })();
                    """.trimIndent()
                ) { result ->
                    fragment.showToast("Synced data from web: $result")
                }
            }
        }

        @JavascriptInterface
        fun getUserStats(): String {
            // Return Android user stats to web app
            return fragment.gson.toJson(mapOf(
                "streak" to 7,
                "totalCards" to 248,
                "accuracy" to 85,
                "level" to 12
            ))
        }
    }

    /**
     * Send data from Android to JavaScript
     */
    fun sendCardToWeb(card: Card) {
        val cardJson = gson.toJson(card)
        webView.evaluateJavascript(
            """
            (function() {
                if (typeof window.receiveAndroidCard === 'function') {
                    window.receiveAndroidCard($cardJson);
                }
            })();
            """.trimIndent()
        ) { result ->
            showToast("Sent card to web app")
        }
    }

    private fun showToast(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
    }

    // Data models for JSON parsing
    data class WebCard(
        val id: Long? = null,
        val question: String,
        val answer: String,
        val hint: String? = null,
        val category: String? = null,
        val interval: Int? = 1,
        val easeFactor: Double? = 2.5,
        val nextReview: Long? = null
    )
}
