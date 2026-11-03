using LeadIntelligence.Api.Domain;
using Xunit;

namespace LeadIntelligence.Api.Tests;

public sealed class LeadLifecycleTests
{
    [Fact]
    public void New_lead_starts_in_new_status_and_trims_name()
    {
        var lead = CreateLead("  Clínica Aurora  ");
        Assert.Equal("Clínica Aurora", lead.BusinessName);
        Assert.Equal(LeadStatus.New, lead.Status);
    }

    [Fact]
    public void Allows_valid_lifecycle_transition()
    {
        var lead = CreateLead();
        Assert.True(lead.TryTransitionTo(LeadStatus.Researching));
        Assert.True(lead.TryTransitionTo(LeadStatus.Qualified));
        Assert.True(lead.TryTransitionTo(LeadStatus.ContactReady));
        Assert.Equal(LeadStatus.ContactReady, lead.Status);
    }

    [Fact]
    public void Rejects_skipping_lifecycle_stages()
    {
        var lead = CreateLead();
        Assert.False(lead.TryTransitionTo(LeadStatus.Contacted));
        Assert.Equal(LeadStatus.New, lead.Status);
    }

    private static Lead CreateLead(string name = "Example Business") =>
        new(name, null, null, null, null, null, null, null, null, null, "Manual", null);
}

