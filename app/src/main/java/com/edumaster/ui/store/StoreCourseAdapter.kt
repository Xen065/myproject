package com.edumaster.ui.store

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.edumaster.data.models.Course
import com.edumaster.databinding.ItemStoreCourseBinding

class StoreCourseAdapter(
    private val onPurchaseClick: (Course) -> Unit
) : ListAdapter<Course, StoreCourseAdapter.CourseViewHolder>(CourseDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CourseViewHolder {
        val binding = ItemStoreCourseBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CourseViewHolder(binding, onPurchaseClick)
    }

    override fun onBindViewHolder(holder: CourseViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class CourseViewHolder(
        private val binding: ItemStoreCourseBinding,
        private val onPurchaseClick: (Course) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(course: Course) {
            binding.apply {
                // Set course info
                courseIcon.text = course.icon
                courseName.text = course.name
                courseCategory.text = course.category
                courseDescription.text = course.description
                courseCardCount.text = "${course.totalCards} cards"
                courseRating.text = if (course.totalRatings > 0) {
                    "${course.rating} (${course.totalRatings})"
                } else {
                    "New"
                }

                if (course.isOwned || course.isPurchased) {
                    // Already owned
                    purchaseButton.visibility = View.GONE
                    ownedBadge.visibility = View.VISIBLE
                } else {
                    // Available for purchase
                    purchaseButton.visibility = View.VISIBLE
                    ownedBadge.visibility = View.GONE
                    purchaseButton.text = "Buy for ${course.price} coins"
                    purchaseButton.setOnClickListener {
                        onPurchaseClick(course)
                    }
                }
            }
        }
    }

    private class CourseDiffCallback : DiffUtil.ItemCallback<Course>() {
        override fun areItemsTheSame(oldItem: Course, newItem: Course): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Course, newItem: Course): Boolean {
            return oldItem == newItem
        }
    }
}
