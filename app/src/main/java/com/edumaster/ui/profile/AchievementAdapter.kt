package com.edumaster.ui.profile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.edumaster.data.models.Achievement
import com.edumaster.databinding.ItemAchievementBinding

class AchievementAdapter : ListAdapter<Achievement, AchievementAdapter.AchievementViewHolder>(
    AchievementDiffCallback()
) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AchievementViewHolder {
        val binding = ItemAchievementBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AchievementViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AchievementViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class AchievementViewHolder(
        private val binding: ItemAchievementBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(achievement: Achievement) {
            binding.apply {
                // Set icon
                achievementIcon.text = achievement.icon

                // Set name and description
                achievementName.text = achievement.name
                achievementDescription.text = achievement.description

                if (achievement.isUnlocked) {
                    // Unlocked achievement
                    achievementBadge.text = "✓"
                    achievementBadge.visibility = View.VISIBLE
                    progressContainer.visibility = View.GONE

                    // Full opacity for unlocked
                    achievementIcon.alpha = 1.0f
                    achievementName.alpha = 1.0f
                    achievementDescription.alpha = 1.0f
                } else {
                    // Locked achievement
                    achievementBadge.text = "🔒"
                    achievementBadge.visibility = View.VISIBLE

                    // Show progress if there is any
                    if (achievement.currentProgress > 0) {
                        progressContainer.visibility = View.VISIBLE
                        achievementProgressBar.max = achievement.requirement
                        achievementProgressBar.progress = achievement.currentProgress
                        achievementProgressText.text =
                            "${achievement.currentProgress}/${achievement.requirement}"
                    } else {
                        progressContainer.visibility = View.GONE
                    }

                    // Reduced opacity for locked
                    achievementIcon.alpha = 0.5f
                    achievementName.alpha = 0.6f
                    achievementDescription.alpha = 0.6f
                }
            }
        }
    }

    private class AchievementDiffCallback : DiffUtil.ItemCallback<Achievement>() {
        override fun areItemsTheSame(oldItem: Achievement, newItem: Achievement): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Achievement, newItem: Achievement): Boolean {
            return oldItem == newItem
        }
    }
}
