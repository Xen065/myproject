package com.edumaster.ui.calendar

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.edumaster.R
import com.edumaster.data.models.StudySession
import com.google.android.material.button.MaterialButton
import com.google.android.material.checkbox.MaterialCheckBox
import java.text.SimpleDateFormat
import java.util.*

class StudySessionAdapter(
    private var sessions: List<StudySession> = emptyList(),
    private val onSessionClick: (StudySession) -> Unit,
    private val onDeleteClick: (StudySession) -> Unit,
    private val onCompleteToggle: (StudySession, Boolean) -> Unit
) : RecyclerView.Adapter<StudySessionAdapter.SessionViewHolder>() {

    inner class SessionViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val courseIcon: TextView = itemView.findViewById(R.id.courseIcon)
        val courseName: TextView = itemView.findViewById(R.id.courseName)
        val sessionTime: TextView = itemView.findViewById(R.id.sessionTime)
        val cardsReviewedText: TextView = itemView.findViewById(R.id.cardsReviewedText)
        val accuracyText: TextView = itemView.findViewById(R.id.accuracyText)
        val recurringBadge: TextView = itemView.findViewById(R.id.recurringBadge)
        val completionInfo: View = itemView.findViewById(R.id.completionInfo)
        val completedCheckbox: MaterialCheckBox = itemView.findViewById(R.id.completedCheckbox)
        val deleteButton: MaterialButton = itemView.findViewById(R.id.deleteButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SessionViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_study_session, parent, false)
        return SessionViewHolder(view)
    }

    override fun onBindViewHolder(holder: SessionViewHolder, position: Int) {
        val session = sessions[position]

        holder.courseName.text = session.courseName

        // Format session time
        val timeFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
        val sessionTimeStr = try {
            val timeParts = session.scheduledTime.split(":")
            val calendar = Calendar.getInstance()
            calendar.set(Calendar.HOUR_OF_DAY, timeParts[0].toInt())
            calendar.set(Calendar.MINUTE, timeParts[1].toInt())
            "${timeFormat.format(calendar.time)} - ${session.durationMinutes} mins"
        } catch (e: Exception) {
            "${session.scheduledTime} - ${session.durationMinutes} mins"
        }

        holder.sessionTime.text = sessionTimeStr

        // Course icon (you can fetch from course table in real implementation)
        holder.courseIcon.text = "📚"

        // Show completion status
        holder.completedCheckbox.isChecked = session.isCompleted

        if (session.isCompleted) {
            holder.completionInfo.visibility = View.VISIBLE
            holder.cardsReviewedText.text = "Cards: ${session.cardsReviewed}"

            val accuracy = if (session.cardsReviewed > 0) {
                ((session.cardsCorrect.toFloat() / session.cardsReviewed) * 100).toInt()
            } else 0
            holder.accuracyText.text = "Accuracy: $accuracy%"
        } else {
            holder.completionInfo.visibility = View.GONE
        }

        // TODO: Show recurring badge if session is part of recurring pattern
        holder.recurringBadge.visibility = View.GONE

        // Click listeners
        holder.itemView.setOnClickListener {
            onSessionClick(session)
        }

        holder.deleteButton.setOnClickListener {
            onDeleteClick(session)
        }

        holder.completedCheckbox.setOnCheckedChangeListener { _, isChecked ->
            onCompleteToggle(session, isChecked)
        }
    }

    override fun getItemCount(): Int = sessions.size

    fun updateSessions(newSessions: List<StudySession>) {
        sessions = newSessions
        notifyDataSetChanged()
    }
}
