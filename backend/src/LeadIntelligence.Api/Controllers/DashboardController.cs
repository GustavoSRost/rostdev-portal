using LeadIntelligence.Api.Contracts;
using LeadIntelligence.Api.Data;
using LeadIntelligence.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeadIntelligence.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var weekStart = now.AddDays(-7);
        var counts = await db.Leads.AsNoTracking().GroupBy(x => x.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Status, x => x.Count, ct);
        int Count(LeadStatus status) => counts.GetValueOrDefault(status);
        var total = counts.Values.Sum();
        var added = await db.Leads.CountAsync(x => x.CreatedAt >= weekStart, ct);
        var funnel = new Dictionary<string, int>
        {
            ["discovered"] = total,
            ["qualified"] = Count(LeadStatus.Qualified) + Count(LeadStatus.ContactReady) + Count(LeadStatus.Contacted) + Count(LeadStatus.Responded) + Count(LeadStatus.Proposal) + Count(LeadStatus.Won),
            ["contactReady"] = Count(LeadStatus.ContactReady),
            ["contacted"] = Count(LeadStatus.Contacted) + Count(LeadStatus.Responded) + Count(LeadStatus.Proposal) + Count(LeadStatus.Won),
            ["responded"] = Count(LeadStatus.Responded) + Count(LeadStatus.Proposal) + Count(LeadStatus.Won),
            ["proposal"] = Count(LeadStatus.Proposal) + Count(LeadStatus.Won),
            ["won"] = Count(LeadStatus.Won)
        };
        return Ok(new DashboardDto(total, Count(LeadStatus.New), Count(LeadStatus.Qualified),
            Count(LeadStatus.Contacted), Count(LeadStatus.Proposal), Count(LeadStatus.Won), added,
            Count(LeadStatus.New) + Count(LeadStatus.Researching) + Count(LeadStatus.ContactReady), funnel));
    }
}

