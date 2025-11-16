package com.edumaster.ui.calendar

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.edumaster.data.database.AppDatabase
import com.edumaster.data.repository.EduMasterRepository
import com.edumaster.databinding.FragmentCalendarBinding

class CalendarFragment : Fragment() {

    private var _binding: FragmentCalendarBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: CalendarViewModel
    private lateinit var sessionAdapter: SessionAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCalendarBinding.inflate(inflater, container, false)
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
            CalendarViewModelFactory(repository)
        )[CalendarViewModel::class.java]

        setupRecyclerView()
        setupObservers()
    }

    private fun setupRecyclerView() {
        sessionAdapter = SessionAdapter()
        binding.sessionsRecyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = sessionAdapter
        }
    }

    private fun setupObservers() {
        // Observe user stats for streaks
        viewModel.userStats.observe(viewLifecycleOwner) { stats ->
            stats?.let {
                binding.currentStreakValue.text = it.currentStreak.toString()
                binding.longestStreakValue.text = it.longestStreak.toString()
            }
        }

        // Observe study sessions
        viewModel.allSessions.observe(viewLifecycleOwner) { sessions ->
            if (sessions.isEmpty()) {
                binding.sessionsRecyclerView.visibility = View.GONE
                binding.emptyState.visibility = View.VISIBLE
            } else {
                binding.sessionsRecyclerView.visibility = View.VISIBLE
                binding.emptyState.visibility = View.GONE
                sessionAdapter.submitList(sessions)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
