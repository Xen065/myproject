package com.edumaster.data.database

import androidx.room.TypeConverter
import com.edumaster.data.models.RecurrenceFrequency
import java.util.Date

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }

    @TypeConverter
    fun fromIntList(value: String?): List<Int> {
        return value?.split(",")?.mapNotNull { it.toIntOrNull() } ?: emptyList()
    }

    @TypeConverter
    fun toIntList(list: List<Int>?): String {
        return list?.joinToString(",") ?: ""
    }

    @TypeConverter
    fun fromRecurrenceFrequency(value: RecurrenceFrequency?): String? {
        return value?.name
    }

    @TypeConverter
    fun toRecurrenceFrequency(value: String?): RecurrenceFrequency? {
        return value?.let { RecurrenceFrequency.valueOf(it) }
    }
}
