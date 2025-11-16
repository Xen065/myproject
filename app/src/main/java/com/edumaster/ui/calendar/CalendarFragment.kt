package com.edumaster.ui.calendar

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.edumaster.R
import com.edumaster.data.models.Course
import com.edumaster.data.models.StudySession
import com.google.android.material.button.MaterialButton
import com.google.android.material.checkbox.MaterialCheckBox
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputEditText
import com.kizitonwose.calendar.core.CalendarDay
import com.kizitonwose.calendar.core.CalendarMonth
import com.kizitonwose.calendar.core.daysOfWeek
import com.kizitonwose.calendar.view.CalendarView
import com.kizitonwose.calendar.view.MonthDayBinder
import com.kizitonwose.calendar.view.ViewContainer
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.time.YearMonth
import java.time.LocalDate
import java.time.ZoneId
import java.util.*

class CalendarFragment : Fragment() {

    private lateinit var viewModel: CalendarViewModel
    private lateinit var calendarView: CalendarView
    private lateinit var sessionsRecyclerView: RecyclerView
    private lateinit var sessionAdapter: StudySessionAdapter
    private lateinit var emptyStateText: TextView
    private lateinit var selectedDateText: TextView
    private lateinit var monthYearText: TextView
    private lateinit var sessionCountBadge: TextView
    private lateinit var addSessionFab: FloatingActionButton

    private var selectedDate: Date = Date()
    private val dateFormat = SimpleDateFormat("MMMM d, yyyy", Locale.getDefault())
    private val monthYearFormat = SimpleDateFormat("MMMM yyyy", Locale.getDefault())

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_calendar, container, false)

        viewModel = ViewModelProvider(this)[CalendarViewModel::class.java]

        initViews(view)
        setupCalendarView()
        setupRecyclerView()
        setupObservers()
        setupClickListeners()

        return view
    }

    private fun initViews(view: View) {
        calendarView = view.findViewById(R.id.calendarView)
        sessionsRecyclerView = view.findViewById(R.id.sessionsRecyclerView)
        emptyStateText = view.findViewById(R.id.emptyStateText)
        selectedDateText = view.findViewById(R.id.selectedDateText)
        monthYearText = view.findViewById(R.id.monthYearText)
        sessionCountBadge = view.findViewById(R.id.sessionCountBadge)
        addSessionFab = view.findViewById(R.id.addSessionFab)

        // Update selected date text
        selectedDateText.text = dateFormat.format(selectedDate)
    }

    private fun setupCalendarView() {
        val currentMonth = YearMonth.now()
        val startMonth = currentMonth.minusMonths(12)
        val endMonth = currentMonth.plusMonths(12)
        val daysOfWeek = daysOfWeek()

        calendarView.setup(startMonth, endMonth, daysOfWeek.first())
        calendarView.scrollToMonth(currentMonth)

        monthYearText.text = monthYearFormat.format(Date())

        // Day binder
        calendarView.dayBinder = object : MonthDayBinder<DayViewContainer> {
            override fun create(view: View) = DayViewContainer(view)

            override fun bind(container: DayViewContainer, data: CalendarDay) {
                container.day = data
                container.dayText.text = data.date.dayOfMonth.toString()

                // Highlight today
                val today = LocalDate.now()
                if (data.date == today) {
                    container.dayText.setBackgroundResource(R.drawable.stat_icon_background)
                } else {
                    container.dayText.background = null
                }

                // Handle selection
                val isSelected = selectedDate.toLocalDate() == data.date
                if (isSelected) {
                    container.dayText.setTextColor(resources.getColor(android.R.color.holo_blue_dark, null))
                } else {
                    container.dayText.setTextColor(resources.getColor(android.R.color.black, null))
                }

                // TODO: Show event indicator if there are sessions on this day
                container.eventIndicator.visibility = View.GONE

                container.view.setOnClickListener {
                    val newSelectedDate = data.date.toDate()
                    if (selectedDate != newSelectedDate) {
                        val oldDate = selectedDate
                        selectedDate = newSelectedDate
                        selectedDateText.text = dateFormat.format(selectedDate)
                        viewModel.selectDate(selectedDate)

                        // Refresh both old and new date views
                        calendarView.notifyDateChanged(oldDate.toLocalDate())
                        calendarView.notifyDateChanged(data.date)
                    }
                }
            }
        }

        // Month scroll listener
        calendarView.monthScrollListener = { month ->
            monthYearText.text = "${month.yearMonth.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${month.yearMonth.year}"
        }
    }

    private fun setupRecyclerView() {
        sessionAdapter = StudySessionAdapter(
            onSessionClick = { session ->
                // Handle session click - could show details or edit
            },
            onDeleteClick = { session ->
                showDeleteConfirmation(session)
            },
            onCompleteToggle = { session, isCompleted ->
                handleSessionCompletion(session, isCompleted)
            }
        )

        sessionsRecyclerView.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = sessionAdapter
        }
    }

    private fun setupObservers() {
        viewModel.sessionsForSelectedDate.observe(viewLifecycleOwner) { sessions ->
            if (sessions.isEmpty()) {
                emptyStateText.visibility = View.VISIBLE
                sessionsRecyclerView.visibility = View.GONE
                sessionCountBadge.visibility = View.GONE
            } else {
                emptyStateText.visibility = View.GONE
                sessionsRecyclerView.visibility = View.VISIBLE
                sessionCountBadge.visibility = View.VISIBLE
                sessionCountBadge.text = sessions.size.toString()
                sessionAdapter.updateSessions(sessions)
            }
        }
    }

    private fun setupClickListeners() {
        addSessionFab.setOnClickListener {
            showAddSessionDialog()
        }

        view?.findViewById<MaterialButton>(R.id.todayButton)?.setOnClickListener {
            selectedDate = Date()
            selectedDateText.text = dateFormat.format(selectedDate)
            viewModel.selectDate(selectedDate)
            calendarView.scrollToMonth(YearMonth.now())
            calendarView.notifyCalendarChanged()
        }

        view?.findViewById<MaterialButton>(R.id.previousMonthButton)?.setOnClickListener {
            calendarView.findFirstVisibleMonth()?.let {
                calendarView.smoothScrollToMonth(it.yearMonth.minusMonths(1))
            }
        }

        view?.findViewById<MaterialButton>(R.id.nextMonthButton)?.setOnClickListener {
            calendarView.findFirstVisibleMonth()?.let {
                calendarView.smoothScrollToMonth(it.yearMonth.plusMonths(1))
            }
        }
    }

    private fun showAddSessionDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_study_session, null)
        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        val courseDropdown = dialogView.findViewById<AutoCompleteTextView>(R.id.courseDropdown)
        val dateEditText = dialogView.findViewById<TextInputEditText>(R.id.dateEditText)
        val timeEditText = dialogView.findViewById<TextInputEditText>(R.id.timeEditText)
        val durationEditText = dialogView.findViewById<TextInputEditText>(R.id.durationEditText)
        val reminderCheckbox = dialogView.findViewById<MaterialCheckBox>(R.id.reminderCheckbox)
        val reminderTimeDropdown = dialogView.findViewById<AutoCompleteTextView>(R.id.reminderTimeDropdown)
        val saveButton = dialogView.findViewById<MaterialButton>(R.id.saveButton)
        val cancelButton = dialogView.findViewById<MaterialButton>(R.id.cancelButton)

        // Setup course dropdown
        var selectedCourse: Course? = null
        viewModel.ownedCourses.observe(viewLifecycleOwner) { courses ->
            val courseNames = courses.map { "${it.icon} ${it.name}" }
            val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, courseNames)
            courseDropdown.setAdapter(adapter)
            courseDropdown.setOnItemClickListener { _, _, position, _ ->
                selectedCourse = courses[position]
            }
        }

        // Setup reminder time dropdown
        val reminderOptions = arrayOf("5 minutes before", "15 minutes before", "30 minutes before", "1 hour before")
        val reminderAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, reminderOptions)
        reminderTimeDropdown.setAdapter(reminderAdapter)

        // Set default date to selected date
        dateEditText.setText(dateFormat.format(selectedDate))
        var selectedDialogDate = selectedDate

        // Date picker
        dateEditText.setOnClickListener {
            val calendar = Calendar.getInstance()
            calendar.time = selectedDialogDate

            DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    calendar.set(year, month, day)
                    selectedDialogDate = calendar.time
                    dateEditText.setText(dateFormat.format(selectedDialogDate))
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show()
        }

        // Time picker
        var selectedTime = "09:00"
        timeEditText.setOnClickListener {
            val calendar = Calendar.getInstance()
            TimePickerDialog(
                requireContext(),
                { _, hour, minute ->
                    selectedTime = String.format("%02d:%02d", hour, minute)
                    val timeCalendar = Calendar.getInstance()
                    timeCalendar.set(Calendar.HOUR_OF_DAY, hour)
                    timeCalendar.set(Calendar.MINUTE, minute)
                    val timeFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
                    timeEditText.setText(timeFormat.format(timeCalendar.time))
                },
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE),
                false
            ).show()
        }

        // Reminder checkbox logic
        reminderCheckbox.setOnCheckedChangeListener { _, isChecked ->
            dialogView.findViewById<View>(R.id.reminderTimeInputLayout).visibility =
                if (isChecked) View.VISIBLE else View.GONE
        }

        // Save button
        saveButton.setOnClickListener {
            if (selectedCourse == null) {
                courseDropdown.error = "Please select a course"
                return@setOnClickListener
            }

            if (timeEditText.text.isNullOrEmpty()) {
                timeEditText.error = "Please select a time"
                return@setOnClickListener
            }

            val duration = durationEditText.text.toString().toIntOrNull() ?: 30
            val setReminder = reminderCheckbox.isChecked
            val reminderMinutes = when (reminderTimeDropdown.text.toString()) {
                "5 minutes before" -> 5
                "15 minutes before" -> 15
                "30 minutes before" -> 30
                "1 hour before" -> 60
                else -> 15
            }

            lifecycleScope.launch {
                viewModel.createStudySession(
                    courseId = selectedCourse!!.id,
                    courseName = selectedCourse!!.name,
                    scheduledDate = selectedDialogDate,
                    scheduledTime = selectedTime,
                    durationMinutes = duration,
                    setReminder = setReminder,
                    reminderMinutesBefore = reminderMinutes
                )

                dialog.dismiss()

                // Refresh calendar
                calendarView.notifyDateChanged(selectedDialogDate.toLocalDate())
            }
        }

        cancelButton.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun showDeleteConfirmation(session: StudySession) {
        AlertDialog.Builder(requireContext())
            .setTitle("Delete Session")
            .setMessage("Are you sure you want to delete this study session?")
            .setPositiveButton("Delete") { _, _ ->
                lifecycleScope.launch {
                    viewModel.deleteSession(session)
                    calendarView.notifyDateChanged(session.scheduledDate.toLocalDate())
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun handleSessionCompletion(session: StudySession, isCompleted: Boolean) {
        if (isCompleted && !session.isCompleted) {
            // Show completion dialog
            showSessionCompletionDialog(session)
        } else if (!isCompleted && session.isCompleted) {
            // Uncomplete the session
            lifecycleScope.launch {
                viewModel.updateSession(session.copy(isCompleted = false, cardsReviewed = 0, cardsCorrect = 0))
            }
        }
    }

    private fun showSessionCompletionDialog(session: StudySession) {
        val dialogView = layoutInflater.inflate(android.R.layout.simple_list_item_2, null)
        // In a real implementation, you'd create a proper dialog to input cards reviewed and correct
        // For now, we'll just mark it as completed with placeholder values
        lifecycleScope.launch {
            viewModel.completeSession(session.id, 10, 8, session.durationMinutes)
        }
    }

    // Helper extensions
    private fun Date.toLocalDate(): LocalDate {
        return this.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
    }

    private fun LocalDate.toDate(): Date {
        return Date.from(this.atStartOfDay(ZoneId.systemDefault()).toInstant())
    }

    inner class DayViewContainer(val view: View) : ViewContainer(view) {
        val dayText: TextView = view.findViewById(R.id.dayText)
        val eventIndicator: View = view.findViewById(R.id.eventIndicator)
        lateinit var day: CalendarDay
    }
}
