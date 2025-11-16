package com.edumaster.ui.store

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.GridLayoutManager
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.FragmentStoreBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import java.util.Locale

class StoreFragment : Fragment() {

    private var _binding: FragmentStoreBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: StoreViewModel
    private lateinit var courseAdapter: StoreCourseAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStoreBinding.inflate(inflater, container, false)
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
            StoreViewModelFactory(repository)
        )[StoreViewModel::class.java]

        setupCoursesRecyclerView()
        setupCategoryButtons()
        setupObservers()
    }

    private fun setupCoursesRecyclerView() {
        courseAdapter = StoreCourseAdapter { course ->
            showPurchaseDialog(course)
        }
        binding.coursesRecyclerView.apply {
            layoutManager = GridLayoutManager(requireContext(), 1)
            adapter = courseAdapter
        }
    }

    private fun setupCategoryButtons() {
        binding.categoryAll.setOnClickListener {
            viewModel.availableCourses.observe(viewLifecycleOwner) { courses ->
                updateCoursesList(courses)
            }
        }

        binding.categoryVocabulary.setOnClickListener {
            viewModel.getCoursesByCategory("Vocabulary").observe(viewLifecycleOwner) { courses ->
                updateCoursesList(courses)
            }
        }

        binding.categoryScience.setOnClickListener {
            viewModel.getCoursesByCategory("Science").observe(viewLifecycleOwner) { courses ->
                updateCoursesList(courses)
            }
        }

        binding.categoryHistory.setOnClickListener {
            viewModel.getCoursesByCategory("History").observe(viewLifecycleOwner) { courses ->
                updateCoursesList(courses)
            }
        }

        binding.categoryMath.setOnClickListener {
            viewModel.getCoursesByCategory("Math").observe(viewLifecycleOwner) { courses ->
                updateCoursesList(courses)
            }
        }
    }

    private fun setupObservers() {
        // Observe user stats for coins balance
        viewModel.userStats.observe(viewLifecycleOwner) { stats ->
            stats?.let {
                binding.coinsBalance.text = "${formatNumber(it.coins)} coins"
            }
        }

        // Observe available courses
        viewModel.availableCourses.observe(viewLifecycleOwner) { courses ->
            updateCoursesList(courses)
        }

        // Observe purchase result
        viewModel.purchaseResult.observe(viewLifecycleOwner) { result ->
            when (result) {
                is StoreViewModel.PurchaseResult.Success -> {
                    Snackbar.make(
                        binding.root,
                        "Course purchased successfully!",
                        Snackbar.LENGTH_SHORT
                    ).show()
                    viewModel.clearPurchaseResult()
                }
                is StoreViewModel.PurchaseResult.InsufficientCoins -> {
                    Snackbar.make(
                        binding.root,
                        "You need ${result.needed} more coins",
                        Snackbar.LENGTH_LONG
                    ).show()
                    viewModel.clearPurchaseResult()
                }
                is StoreViewModel.PurchaseResult.Error -> {
                    Snackbar.make(
                        binding.root,
                        result.message,
                        Snackbar.LENGTH_SHORT
                    ).show()
                    viewModel.clearPurchaseResult()
                }
                null -> {}
            }
        }
    }

    private fun updateCoursesList(courses: List<com.edumaster.data.models.Course>) {
        if (courses.isEmpty()) {
            binding.coursesRecyclerView.visibility = View.GONE
            binding.emptyState.visibility = View.VISIBLE
        } else {
            binding.coursesRecyclerView.visibility = View.VISIBLE
            binding.emptyState.visibility = View.GONE
            courseAdapter.submitList(courses)
        }
    }

    private fun showPurchaseDialog(course: com.edumaster.data.models.Course) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Purchase Course")
            .setMessage("Buy \"${course.name}\" for ${course.price} coins?")
            .setPositiveButton("Purchase") { _, _ ->
                viewModel.purchaseCourse(course.id, course.price)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun formatNumber(number: Int): String {
        return String.format(Locale.getDefault(), "%,d", number)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
