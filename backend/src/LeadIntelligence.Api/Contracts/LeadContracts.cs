using System.ComponentModel.DataAnnotations;
using LeadIntelligence.Api.Domain;

namespace LeadIntelligence.Api.Contracts;

public sealed record LeadDto(Guid Id, string BusinessName, string? Category, string? Description,
    string? Phone, string? Email, string? Website, string? Address, string? City, string? State,
    string? Country, string? Source, string? SourceUrl, LeadStatus Status,
    DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, string? GooglePlaceId = null);

public sealed record LeadInput
{
    [Required, StringLength(200, MinimumLength = 1)] public string BusinessName { get; init; } = "";
    [StringLength(120)] public string? Category { get; init; }
    [StringLength(4000)] public string? Description { get; init; }
    [StringLength(80)] public string? Phone { get; init; }
    [EmailAddress, StringLength(254)] public string? Email { get; init; }
    [StringLength(2048), HttpUrl] public string? Website { get; init; }
    [StringLength(300)] public string? Address { get; init; }
    [StringLength(120)] public string? City { get; init; }
    [StringLength(120)] public string? State { get; init; }
    [StringLength(120)] public string? Country { get; init; }
    [StringLength(120)] public string? Source { get; init; }
    [StringLength(2048), HttpUrl] public string? SourceUrl { get; init; }
    [StringLength(255)] public string? GooglePlaceId { get; init; }
}

public sealed class HttpUrlAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value is null || string.IsNullOrWhiteSpace(value.ToString())) return true;
        return Uri.TryCreate(value.ToString(), UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
            && !string.IsNullOrWhiteSpace(uri.Host);
    }
}

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int Total);
public sealed record DashboardDto(int TotalLeads, int NewLeads, int QualifiedLeads,
    int ContactedLeads, int Proposals, int WonLeads, int AddedThisWeek, int RequiringAttention,
    IReadOnlyDictionary<string, int> Funnel);

