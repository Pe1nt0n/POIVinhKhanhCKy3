using System.Text.Json.Serialization;

namespace Quan4CulinaryTourism.Api.Common.Models;

/// <summary>
/// Standardized API response wrapper used across all endpoints.
/// Ensures consistent JSON structure for both success and error responses.
///
/// Success: { "success": true, "data": {...}, "message": "..." }
/// Error:   { "success": false, "error": "...", "trace_id": "..." }
/// </summary>
/// <typeparam name="T">The type of the data payload.</typeparam>
public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Data { get; set; }

    [JsonPropertyName("message")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Message { get; set; }

    [JsonPropertyName("error")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Error { get; set; }

    [JsonPropertyName("trace_id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? TraceId { get; set; }

    /// <summary>
    /// Creates a successful response with data.
    /// </summary>
    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    /// <summary>
    /// Creates an error response.
    /// </summary>
    public static ApiResponse<T> Fail(string error, string? traceId = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            TraceId = traceId
        };
    }
}

/// <summary>
/// Non-generic version for responses without data payload.
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    /// <summary>
    /// Creates a success response without data.
    /// </summary>
    public static ApiResponse Ok(string? message = null)
    {
        return new ApiResponse
        {
            Success = true,
            Message = message
        };
    }

    /// <summary>
    /// Creates an error response without data.
    /// </summary>
    public new static ApiResponse Fail(string error, string? traceId = null)
    {
        return new ApiResponse
        {
            Success = false,
            Error = error,
            TraceId = traceId
        };
    }
}
