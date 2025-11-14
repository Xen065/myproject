package com.edumaster.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.edumaster.MainActivity
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.FragmentDashboardBinding

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private lateinit var repository: EduMasterRepository
    private lateinit var courseAdapter: CourseAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        repository = (requireActivity() as MainActivity).getRepository()

        setupRecyclerView()
        observeData()
        setupClickListeners()
    }

    private fun setupRecyclerView() {
        courseAdapter = CourseAdapter { course ->
            // Navigate to study screen for this course
            Toast.makeText(context, "Starting ${course.name}", Toast.LENGTH_SHORT).show()
        }

        binding.rvCourses.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = courseAdapter
        }
    }

    private fun observeData() {
        // Observe owned courses
        repository.getOwnedCourses().observe(viewLifecycleOwner) { courses ->
            courseAdapter.submitList(courses)
        }

        // Observe user stats
        repository.getUserStats().observe(viewLifecycleOwner) { stats ->
            stats?.let {
                binding.tvStreakNumber.text = "🔥 ${it.currentStreak}"

                // Calculate due cards, completed, etc.
                // For now using dummy data
                binding.tvDueToday.text = "32"
                binding.tvCompleted.text = "18"
                binding.tvNewCards.text = "5"

                // Study time in minutes
                val hours = it.totalStudyMinutes / 60
                val minutes = it.totalStudyMinutes % 60
                binding.tvStudyTime.text = if (hours > 0) "${hours}h ${minutes}m" else "${minutes}m"

                // Progress (dummy calculation for now)
                val progress = 85
                binding.tvProgressPercentage.text = "$progress%"
                binding.progressBar.progress = progress
                binding.tvProgressMessage.text =
                    "Keep going! Only ${32 - 18} more cards to reach your daily goal."
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnAddCourse.setOnClickListener {
            // Navigate to store
            Toast.makeText(context, "Opening Course Store", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
