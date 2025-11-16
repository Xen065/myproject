package com.edumaster.ui.calendar

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.edumaster.data.models.StudySession
import com.edumaster.databinding.ItemStudySessionBinding
import java.text.SimpleDateFormat
import java.util.Locale

class SessionAdapter : ListAdapter<StudySession, SessionAdapter.SessionViewHolder>(SessionDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SessionViewHolder {
        val binding = ItemStudySessionBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return SessionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SessionViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class SessionViewHolder(
        private val binding: ItemStudySessionBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        private val dayFormat = SimpleDateFormat("dd", Locale.getDefault())
        private val monthFormat = SimpleDateFormat("MMM", Locale.getDefault())

        fun bind(session: StudySession) {
            binding.apply {
                // Date badge
                sessionDay.text = dayFormat.format(session.scheduledDate)
                sessionMonth.text = monthFormat.format(session.scheduledDate)

                // Session info
                sessionCourseName.text = session.courseName
                sessionTime.text = "${session.scheduledTime} • ${session.actualDurationMinutes ?: session.durationMinutes} min"

                // Completion status
                sessionStatus.text = if (session.isCompleted) "✓" else "○"

                // Stats
                cardsReviewedValue.text = session.cardsReviewed.toString()

                val accuracy = if (session.cardsReviewed > 0) {
                    (session.cardsCorrect * 100) / session.cardsReviewed
                } else {
                    0
                }
                accuracyValue.text = "$accuracy%"
            }
        }
    }

    class SessionDiffCallback : DiffUtil.ItemCallback<StudySession>() {
        override fun areItemsTheSame(oldItem: StudySession, newItem: StudySession): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: StudySession, newItem: StudySession): Boolean {
            return oldItem == newItem
        }
    }
}
