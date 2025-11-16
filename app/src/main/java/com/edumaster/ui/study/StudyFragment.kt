package com.edumaster.ui.study

import android.animation.AnimatorInflater
import android.animation.AnimatorSet
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.edumaster.R
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.FragmentStudyBinding

class StudyFragment : Fragment() {

    private var _binding: FragmentStudyBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: StudyViewModel
    private var isFrontShowing = true

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStudyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize ViewModel
        val database = AppDatabase.getDatabase(requireContext())
        val repository = EduMasterRepository(
            database.cardDao(),
            database.courseDao(),
            database.studySessionDao(),
            database.userStatsDao(),
            database.achievementDao()
        )
        viewModel = ViewModelProvider(
            this,
            StudyViewModelFactory(repository)
        )[StudyViewModel::class.java]

        setupObservers()
        setupClickListeners()

        // Start study session
        viewModel.startStudySession()
    }

    private fun setupObservers() {
        // Observe current card
        viewModel.currentCard.observe(viewLifecycleOwner) { card ->
            if (card != null) {
                isFrontShowing = true
                updateCardDisplay()

                // Update course badge
                binding.courseBadge.text = when (card.courseId) {
                    1L -> "English Vocabulary"
                    2L -> "Current Affairs"
                    3L -> "Science Facts"
                    4L -> "Physics"
                    5L -> "Geography"
                    else -> "Course"
                }

                // Update card stats
                val accuracy = if (card.timesReviewed > 0) {
                    (card.timesCorrect.toFloat() / card.timesReviewed * 100).toInt()
                } else {
                    0
                }
                binding.cardStats.text = if (card.timesReviewed > 0) {
                    "Reviewed: ${card.timesReviewed} times • $accuracy% correct"
                } else {
                    "New card"
                }

                // Show flashcard container, hide others
                binding.flashcardContainer.visibility = View.VISIBLE
                binding.sessionHeader.visibility = View.VISIBLE
                binding.actionButtonsContainer.visibility = View.VISIBLE
                binding.emptyStateLayout.visibility = View.GONE
                binding.sessionCompleteCard.visibility = View.GONE
            }
        }

        // Observe show answer state
        viewModel.showAnswer.observe(viewLifecycleOwner) { showAnswer ->
            if (showAnswer) {
                binding.showAnswerButton.visibility = View.GONE
                binding.ratingButtonsLayout.visibility = View.VISIBLE
            } else {
                binding.showAnswerButton.visibility = View.VISIBLE
                binding.ratingButtonsLayout.visibility = View.GONE
            }
        }

        // Observe cards reviewed
        viewModel.cardsReviewed.observe(viewLifecycleOwner) { reviewed ->
            binding.cardsReviewedCount.text = reviewed.toString()
        }

        // Observe total cards and update progress
        viewModel.totalCards.observe(viewLifecycleOwner) { total ->
            val reviewed = viewModel.cardsReviewed.value ?: 0
            binding.progressText.text = "$reviewed/$total"
        }

        // Observe progress percentage
        viewModel.progress.observe(viewLifecycleOwner) { progress ->
            binding.sessionProgressBar.progress = progress
        }

        // Observe XP earned
        viewModel.xpEarned.observe(viewLifecycleOwner) { xp ->
            binding.xpEarned.text = "$xp XP"
        }

        // Observe accuracy
        viewModel.cardsCorrect.observe(viewLifecycleOwner) {
            val accuracy = viewModel.getAccuracy()
            binding.accuracyPercent.text = "$accuracy%"
        }

        // Observe session complete
        viewModel.sessionComplete.observe(viewLifecycleOwner) { complete ->
            if (complete) {
                val reviewed = viewModel.cardsReviewed.value ?: 0
                if (reviewed == 0) {
                    // No cards to study - show empty state
                    showEmptyState()
                } else {
                    // Session completed - show summary
                    showSessionComplete()
                }
            }
        }
    }

    private fun setupClickListeners() {
        // Show Answer button
        binding.showAnswerButton.setOnClickListener {
            isFrontShowing = false
            flipCard()
            viewModel.toggleAnswer()
        }

        // Flashcard click to flip
        binding.flashcardContainer.setOnClickListener {
            if (viewModel.showAnswer.value == false) {
                // Only flip if answer is not showing (prevents accidental flips during rating)
                isFrontShowing = !isFrontShowing
                flipCard()
            }
        }

        // Rating buttons
        binding.ratingWrong.setOnClickListener {
            viewModel.reviewCard(1)
            resetCardState()
        }

        binding.ratingHard.setOnClickListener {
            viewModel.reviewCard(2)
            resetCardState()
        }

        binding.ratingGood.setOnClickListener {
            viewModel.reviewCard(3)
            resetCardState()
        }

        binding.ratingEasy.setOnClickListener {
            viewModel.reviewCard(4)
            resetCardState()
        }

        // Session complete buttons
        binding.studyAgainButton.setOnClickListener {
            viewModel.resetSession()
            viewModel.startStudySession()
        }

        binding.backToDashboardButton.setOnClickListener {
            findNavController().navigate(R.id.navigation_dashboard)
        }

        // Empty state button
        binding.browseCoursesButton.setOnClickListener {
            findNavController().navigate(R.id.navigation_store)
        }
    }

    private fun updateCardDisplay() {
        val card = viewModel.currentCard.value ?: return

        if (isFrontShowing) {
            binding.cardSideLabel.text = "QUESTION"
            binding.cardContent.text = card.question
        } else {
            binding.cardSideLabel.text = "ANSWER"
            binding.cardContent.text = card.answer
        }
    }

    private fun flipCard() {
        // Simple flip animation using rotation
        val card = viewModel.currentCard.value ?: return

        // Rotate out
        binding.flashcardContainer.animate()
            .rotationY(90f)
            .setDuration(150)
            .withEndAction {
                // Update content at 90 degrees
                updateCardDisplay()

                // Rotate in
                binding.flashcardContainer.rotationY = -90f
                binding.flashcardContainer.animate()
                    .rotationY(0f)
                    .setDuration(150)
                    .start()
            }
            .start()
    }

    private fun resetCardState() {
        isFrontShowing = true
    }

    private fun showSessionComplete() {
        // Hide main UI
        binding.flashcardContainer.visibility = View.GONE
        binding.sessionHeader.visibility = View.GONE
        binding.actionButtonsContainer.visibility = View.GONE
        binding.emptyStateLayout.visibility = View.GONE

        // Show completion card
        binding.sessionCompleteCard.visibility = View.VISIBLE

        // Update summary stats
        binding.summaryCardsReviewed.text = viewModel.cardsReviewed.value.toString()
        binding.summaryAccuracy.text = "${viewModel.getAccuracy()}%"
        binding.summaryXp.text = "${viewModel.xpEarned.value} XP"
        binding.summaryCoins.text = viewModel.coinsEarned.value.toString()
    }

    private fun showEmptyState() {
        // Hide main UI
        binding.flashcardContainer.visibility = View.GONE
        binding.sessionHeader.visibility = View.GONE
        binding.actionButtonsContainer.visibility = View.GONE
        binding.sessionCompleteCard.visibility = View.GONE

        // Show empty state
        binding.emptyStateLayout.visibility = View.VISIBLE
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
