package com.edumaster.ui.store

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edumaster.data.models.Course
import com.edumaster.data.models.UserStats
import com.edumaster.data.repository.EduMasterRepository
import kotlinx.coroutines.launch

class StoreViewModel(private val repository: EduMasterRepository) : ViewModel() {

    // User stats for coins balance
    val userStats: LiveData<UserStats?> = repository.getUserStats()

    // All courses (both owned and available)
    val allCourses: LiveData<List<Course>> = repository.getAllCourses()

    // Available courses (not owned)
    val availableCourses: LiveData<List<Course>> = repository.getAvailableCourses()

    // Owned courses
    val ownedCourses: LiveData<List<Course>> = repository.getOwnedCourses()

    // Purchase result
    private val _purchaseResult = MutableLiveData<PurchaseResult>()
    val purchaseResult: LiveData<PurchaseResult> = _purchaseResult

    /**
     * Attempt to purchase a course
     */
    fun purchaseCourse(courseId: Long, price: Int) {
        viewModelScope.launch {
            val stats = repository.getUserStatsSync()
            if (stats == null) {
                _purchaseResult.value = PurchaseResult.Error("User stats not found")
                return@launch
            }

            if (stats.coins < price) {
                _purchaseResult.value = PurchaseResult.InsufficientCoins(price - stats.coins)
                return@launch
            }

            val success = repository.purchaseCourse(courseId, price)
            if (success) {
                _purchaseResult.value = PurchaseResult.Success
            } else {
                _purchaseResult.value = PurchaseResult.Error("Purchase failed")
            }
        }
    }

    /**
     * Get courses by category
     */
    fun getCoursesByCategory(category: String): LiveData<List<Course>> {
        return repository.getAvailableCoursesByCategory(category)
    }

    /**
     * Clear purchase result
     */
    fun clearPurchaseResult() {
        _purchaseResult.value = null
    }

    sealed class PurchaseResult {
        object Success : PurchaseResult()
        data class InsufficientCoins(val needed: Int) : PurchaseResult()
        data class Error(val message: String) : PurchaseResult()
    }
}
