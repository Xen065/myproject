package com.edumaster.ui.store

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.edumaster.data.repository.EduMasterRepository

class StoreViewModelFactory(
    private val repository: EduMasterRepository
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(StoreViewModel::class.java)) {
            return StoreViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
