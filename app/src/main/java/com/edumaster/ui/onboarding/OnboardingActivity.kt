package com.edumaster.ui.onboarding

import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.viewpager2.widget.ViewPager2
import com.edumaster.MainActivity
import com.edumaster.R
import com.edumaster.databinding.ActivityOnboardingBinding

class OnboardingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBinding
    private val onboardingItems = listOf(
        OnboardingItem(
            icon = "🎓",
            title = "Welcome to EduMaster",
            description = "Master any subject with spaced repetition flashcards. Learn smarter, not harder!"
        ),
        OnboardingItem(
            icon = "📚",
            title = "Study with Flashcards",
            description = "Review flashcards using proven spaced repetition algorithm. Retain knowledge longer!"
        ),
        OnboardingItem(
            icon = "📊",
            title = "Track Your Progress",
            description = "Monitor your learning journey with detailed stats, streaks, and achievements!"
        )
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupViewPager()
        setupDotsIndicator()
        setupClickListeners()
    }

    private fun setupViewPager() {
        val adapter = OnboardingAdapter(onboardingItems)
        binding.viewPager.adapter = adapter

        binding.viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                updateDotsIndicator(position)
                updateButtons(position)
            }
        })
    }

    private fun setupDotsIndicator() {
        val dots = arrayOfNulls<ImageView>(onboardingItems.size)
        val params = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        params.setMargins(8, 0, 8, 0)

        for (i in dots.indices) {
            dots[i] = ImageView(this)
            dots[i]?.setImageDrawable(
                ContextCompat.getDrawable(this, R.drawable.dot_inactive)
            )
            binding.dotsIndicator.addView(dots[i], params)
        }

        updateDotsIndicator(0)
    }

    private fun updateDotsIndicator(position: Int) {
        val childCount = binding.dotsIndicator.childCount
        for (i in 0 until childCount) {
            val imageView = binding.dotsIndicator.getChildAt(i) as ImageView
            if (i == position) {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(this, R.drawable.dot_active)
                )
            } else {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(this, R.drawable.dot_inactive)
                )
            }
        }
    }

    private fun updateButtons(position: Int) {
        if (position == onboardingItems.size - 1) {
            // Last page - show "Get Started" button
            binding.btnNext.visibility = View.GONE
            binding.btnGetStarted.visibility = View.VISIBLE
            binding.btnSkip.visibility = View.GONE
        } else {
            // Other pages - show "Next" button
            binding.btnNext.visibility = View.VISIBLE
            binding.btnGetStarted.visibility = View.GONE
            binding.btnSkip.visibility = View.VISIBLE
        }
    }

    private fun setupClickListeners() {
        binding.btnNext.setOnClickListener {
            val currentItem = binding.viewPager.currentItem
            if (currentItem < onboardingItems.size - 1) {
                binding.viewPager.currentItem = currentItem + 1
            }
        }

        binding.btnSkip.setOnClickListener {
            finishOnboarding()
        }

        binding.btnGetStarted.setOnClickListener {
            finishOnboarding()
        }
    }

    private fun finishOnboarding() {
        // Mark onboarding as completed
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
        prefs.edit().putBoolean("onboarding_completed", true).apply()

        // Navigate to MainActivity
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }
}
