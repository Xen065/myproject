package com.edumaster.api

import com.edumaster.data.models.Card
import com.edumaster.data.models.Course
import com.edumaster.data.models.StudySession
import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

/**
 * Android API Client for EduMaster Backend
 *
 * Setup in build.gradle:
 * implementation 'com.squareup.retrofit2:retrofit:2.9.0'
 * implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
 *
 * Usage:
 * val api = EduMasterApiService.create()
 * val cards = api.getCards(userId = 1)
 */

interface EduMasterApiService {

    @GET("cards")
    suspend fun getCards(
        @Query("userId") userId: Long = 1
    ): Response<ApiResponse<List<CardDto>>>

    @POST("cards")
    suspend fun createCard(
        @Body request: CreateCardRequest
    ): Response<ApiResponse<CardIdResponse>>

    @PUT("cards/{id}")
    suspend fun updateCard(
        @Path("id") cardId: Long,
        @Body request: UpdateCardRequest
    ): Response<ApiResponse<String>>

    @GET("users/{id}")
    suspend fun getUserStats(
        @Path("id") userId: Long
    ): Response<ApiResponse<UserStatsDto>>

    @POST("sync")
    suspend fun syncData(
        @Body request: SyncRequest
    ): Response<ApiResponse<SyncResponse>>

    @GET("courses")
    suspend fun getCourses(): Response<ApiResponse<List<CourseDto>>>

    @GET("sessions")
    suspend fun getSessions(
        @Query("userId") userId: Long = 1
    ): Response<ApiResponse<List<StudySessionDto>>>

    companion object {
        private const val BASE_URL = "http://10.0.2.2:3000/api/" // Android emulator localhost

        fun create(): EduMasterApiService {
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            return retrofit.create(EduMasterApiService::class.java)
        }
    }
}

// ==================== Data Models ====================

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T? = null,
    @SerializedName("cards") val cards: List<CardDto>? = null,
    @SerializedName("user") val user: UserStatsDto? = null,
    @SerializedName("courses") val courses: List<CourseDto>? = null,
    @SerializedName("sessions") val sessions: List<StudySessionDto>? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("error") val error: String? = null,
    @SerializedName("count") val count: Int? = null,
    @SerializedName("cardId") val cardId: Long? = null,
    @SerializedName("uploaded") val uploaded: Int? = null
)

data class CardDto(
    @SerializedName("id") val id: Long,
    @SerializedName("question") val question: String,
    @SerializedName("answer") val answer: String,
    @SerializedName("hint") val hint: String?,
    @SerializedName("category") val category: String?,
    @SerializedName("interval") val interval: Int,
    @SerializedName("ease_factor") val easeFactor: Double,
    @SerializedName("next_review") val nextReview: String?,
    @SerializedName("created_at") val createdAt: String?
)

data class CreateCardRequest(
    @SerializedName("userId") val userId: Long = 1,
    @SerializedName("question") val question: String,
    @SerializedName("answer") val answer: String,
    @SerializedName("hint") val hint: String? = null,
    @SerializedName("category") val category: String? = "general"
)

data class UpdateCardRequest(
    @SerializedName("interval") val interval: Int,
    @SerializedName("easeFactor") val easeFactor: Double,
    @SerializedName("nextReview") val nextReview: String
)

data class CardIdResponse(
    @SerializedName("cardId") val cardId: Long
)

data class UserStatsDto(
    @SerializedName("id") val id: Long,
    @SerializedName("username") val username: String,
    @SerializedName("current_streak") val currentStreak: Int,
    @SerializedName("total_cards_studied") val totalCardsStudied: Int,
    @SerializedName("accuracy") val accuracy: Double,
    @SerializedName("level") val level: Int,
    @SerializedName("coins") val coins: Int
)

data class SyncRequest(
    @SerializedName("userId") val userId: Long = 1,
    @SerializedName("cards") val cards: List<CardDto>,
    @SerializedName("sessions") val sessions: List<StudySessionDto>? = null
)

data class SyncResponse(
    @SerializedName("uploaded") val uploaded: Int
)

data class CourseDto(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String?,
    @SerializedName("category") val category: String?,
    @SerializedName("icon") val icon: String?,
    @SerializedName("price") val price: Int,
    @SerializedName("rating") val rating: Double,
    @SerializedName("total_ratings") val totalRatings: Int,
    @SerializedName("total_cards") val totalCards: Int
)

data class StudySessionDto(
    @SerializedName("id") val id: Long,
    @SerializedName("user_id") val userId: Long,
    @SerializedName("course_name") val courseName: String,
    @SerializedName("date") val date: String,
    @SerializedName("time") val time: String,
    @SerializedName("duration") val duration: Int,
    @SerializedName("cards_reviewed") val cardsReviewed: Int
)

/**
 * Repository class to use the API
 */
class ApiRepository(private val api: EduMasterApiService) {

    suspend fun syncCardsToServer(cards: List<Card>): Result<Int> {
        return try {
            val cardDtos = cards.map { card ->
                CardDto(
                    id = card.id,
                    question = card.question,
                    answer = card.answer,
                    hint = card.hint,
                    category = "general",
                    interval = card.interval,
                    easeFactor = card.easeFactor,
                    nextReview = card.nextReview.toString(),
                    createdAt = null
                )
            }

            val response = api.syncData(SyncRequest(userId = 1, cards = cardDtos))

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.uploaded ?: 0)
            } else {
                Result.failure(Exception(response.body()?.error ?: "Sync failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun loadCardsFromServer(): Result<List<CardDto>> {
        return try {
            val response = api.getCards(userId = 1)

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.cards ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.error ?: "Failed to load cards"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUserStatsFromServer(): Result<UserStatsDto> {
        return try {
            val response = api.getUserStats(userId = 1)

            if (response.isSuccessful && response.body()?.success == true) {
                val user = response.body()?.user
                if (user != null) {
                    Result.success(user)
                } else {
                    Result.failure(Exception("User data not found"))
                }
            } else {
                Result.failure(Exception(response.body()?.error ?: "Failed to load stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

/**
 * Example usage in your Fragment/Activity:
 *
 * lifecycleScope.launch {
 *     val api = EduMasterApiService.create()
 *     val repository = ApiRepository(api)
 *
 *     // Load cards from server
 *     val result = repository.loadCardsFromServer()
 *     result.onSuccess { cards ->
 *         // Update UI with cards
 *         Toast.makeText(context, "Loaded ${cards.size} cards", Toast.LENGTH_SHORT).show()
 *     }
 *     result.onFailure { error ->
 *         Toast.makeText(context, "Error: ${error.message}", Toast.LENGTH_SHORT).show()
 *     }
 * }
 */
