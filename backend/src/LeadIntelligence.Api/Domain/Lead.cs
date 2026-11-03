namespace LeadIntelligence.Api.Domain;

public sealed class Lead
{
    private Lead() { }

    public Lead(string businessName, string? category, string? description, string? phone,
        string? email, string? website, string? address, string? city, string? state,
        string? country, string? source, string? sourceUrl, string? googlePlaceId = null)
    {
        Id = Guid.NewGuid();
        BusinessName = businessName.Trim();
        Category = Clean(category);
        Description = Clean(description);
        Phone = Clean(phone);
        Email = Clean(email);
        Website = Clean(website);
        Address = Clean(address);
        City = Clean(city);
        State = Clean(state);
        Country = Clean(country);
        Source = Clean(source);
        SourceUrl = Clean(sourceUrl);
        GooglePlaceId = Clean(googlePlaceId);
        CreatedAt = UpdatedAt = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public string BusinessName { get; private set; } = "";
    public string? Category { get; private set; }
    public string? Description { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Website { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? Country { get; private set; }
    public string? Source { get; private set; }
    public string? SourceUrl { get; private set; }
    public string? GooglePlaceId { get; private set; }
    public LeadStatus Status { get; private set; } = LeadStatus.New;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public void Update(string businessName, string? category, string? description, string? phone,
        string? email, string? website, string? address, string? city, string? state,
        string? country, string? source, string? sourceUrl, string? googlePlaceId = null)
    {
        BusinessName = businessName.Trim();
        Category = Clean(category); Description = Clean(description); Phone = Clean(phone);
        Email = Clean(email); Website = Clean(website); Address = Clean(address);
        City = Clean(city); State = Clean(state); Country = Clean(country);
        Source = Clean(source); SourceUrl = Clean(sourceUrl);
        GooglePlaceId = Clean(googlePlaceId);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public bool TryTransitionTo(LeadStatus next)
    {
        if (next == Status || !AllowedTransitions[Status].Contains(next)) return false;
        Status = next;
        UpdatedAt = DateTimeOffset.UtcNow;
        return true;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static readonly IReadOnlyDictionary<LeadStatus, HashSet<LeadStatus>> AllowedTransitions =
        new Dictionary<LeadStatus, HashSet<LeadStatus>>
        {
            [LeadStatus.New] = [LeadStatus.Researching, LeadStatus.Disqualified, LeadStatus.Archived],
            [LeadStatus.Researching] = [LeadStatus.New, LeadStatus.Qualified, LeadStatus.Disqualified, LeadStatus.Archived],
            [LeadStatus.Qualified] = [LeadStatus.Researching, LeadStatus.ContactReady, LeadStatus.Disqualified, LeadStatus.Archived],
            [LeadStatus.ContactReady] = [LeadStatus.Qualified, LeadStatus.Contacted, LeadStatus.Disqualified, LeadStatus.Archived],
            [LeadStatus.Contacted] = [LeadStatus.Responded, LeadStatus.Lost, LeadStatus.Archived],
            [LeadStatus.Responded] = [LeadStatus.ContactReady, LeadStatus.Proposal, LeadStatus.Lost, LeadStatus.Archived],
            [LeadStatus.Proposal] = [LeadStatus.Won, LeadStatus.Lost, LeadStatus.Archived],
            [LeadStatus.Won] = [LeadStatus.Archived],
            [LeadStatus.Lost] = [LeadStatus.Researching, LeadStatus.Archived],
            [LeadStatus.Disqualified] = [LeadStatus.Researching, LeadStatus.Archived],
            [LeadStatus.Archived] = [LeadStatus.Researching]
        };
}

