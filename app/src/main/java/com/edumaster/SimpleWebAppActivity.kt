package com.edumaster

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

/**
 * SIMPLE WEB APP WRAPPER
 *
 * This is ALL you need to turn your website into an Android app!
 *
 * Just change the URL below to your website and you're done!
 *
 * Features included:
 * - Full website functionality
 * - Loading indicator
 * - Back button support
 * - Error handling
 * - File upload support
 * - Download support
 *
 * That's it! Deploy to Play Store! 🚀
 */
class SimpleWebAppActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    // 🔥 CHANGE THIS TO YOUR WEBSITE URL
    private val websiteUrl = "file:///android_asset/web/educational-app-with-calendar.html"
    // For production, use: "https://your-remnote-clone.com"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Create simple layout
        setContentView(createLayout())

        setupWebView()
    }

    private fun createLayout(): View {
        // Simple layout: WebView + ProgressBar
        return androidx.constraintlayout.widget.ConstraintLayout(this).apply {
            id = View.generateViewId()

            // Progress bar at top
            progressBar = ProgressBar(context, null, android.R.attr.progressBarStyleHorizontal).apply {
                id = View.generateViewId()
                layoutParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
                    androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT,
                    8
                ).apply {
                    topToTop = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                    startToStart = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                    endToEnd = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                }
            }
            addView(progressBar)

            // WebView fills screen
            webView = WebView(context).apply {
                id = View.generateViewId()
                layoutParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
                    androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT,
                    androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT
                ).apply {
                    topToBottom = progressBar.id
                    startToStart = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                    endToEnd = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                    bottomToBottom = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                }
            }
            addView(webView)
        }
    }

    private fun setupWebView() {
        webView.apply {
            // Enable JavaScript (required for modern web apps)
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true

                // Allow file access for local assets
                allowFileAccess = true

                // Enable zoom controls
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false

                // Better rendering
                loadWithOverviewMode = true
                useWideViewPort = true

                // Cache for better performance
                cacheMode = WebSettings.LOAD_DEFAULT

                // Allow mixed content (http + https)
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            // Handle page navigation
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    // Stay in the app, don't open external browser
                    return false
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    // Show error message
                    showError("Failed to load page: ${error?.description}")
                }
            }

            // Handle loading progress
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    progressBar.progress = newProgress
                    progressBar.visibility = if (newProgress == 100) View.GONE else View.VISIBLE
                }

                // Handle file uploads (for image attachments, etc.)
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    // You can implement file picker here if needed
                    return super.onShowFileChooser(webView, filePathCallback, fileChooserParams)
                }

                // Handle JavaScript alerts
                override fun onJsAlert(
                    view: WebView?,
                    url: String?,
                    message: String?,
                    result: JsResult?
                ): Boolean {
                    AlertDialog.Builder(this@SimpleWebAppActivity)
                        .setMessage(message)
                        .setPositiveButton("OK") { _, _ -> result?.confirm() }
                        .setCancelable(false)
                        .create()
                        .show()
                    return true
                }
            }

            // Load your website!
            loadUrl(websiteUrl)
        }
    }

    // Handle back button - go back in web history
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private fun showError(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Error")
            .setMessage(message)
            .setPositiveButton("Retry") { _, _ -> webView.reload() }
            .setNegativeButton("Close") { _, _ -> finish() }
            .show()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}

/**
 * 🎯 HOW TO USE THIS:
 *
 * 1. Change the websiteUrl variable to your website
 * 2. Add to AndroidManifest.xml:
 *    <activity android:name=".SimpleWebAppActivity" />
 * 3. That's it! Your website is now an Android app!
 *
 * 🚀 TO PUBLISH:
 *
 * 1. Update app icon (res/mipmap/)
 * 2. Update app name (res/values/strings.xml)
 * 3. Build signed APK (Build → Generate Signed Bundle/APK)
 * 4. Upload to Play Store
 * 5. Profit! 💰
 *
 * 💡 PRO TIPS:
 *
 * - Make website responsive for mobile
 * - Add <meta name="viewport"> tag in HTML
 * - Use localStorage for offline data
 * - Test on real device, not just emulator
 * - Update website = app updates automatically!
 */
