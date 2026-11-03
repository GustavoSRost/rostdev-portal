using LeadIntelligence.Api.Contracts;
using LeadIntelligence.Api.Data;
using LeadIntelligence.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeadIntelligence.Api.Controllers;

[ApiController]
[Route("api/leads")]
public sealed class LeadsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<LeadDto>>> List([FromQuery] string? search,
        [FromQuery] LeadStatus? status, [FromQuery] string? city, [FromQuery] string? category,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.Leads.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.BusinessName.Contains(term) || (x.Description != null && x.Description.Contains(term)));
        }
        if (status is not null) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(city)) query = query.Where(x => x.City == city.Trim());
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(x => x.Category == category.Trim());
        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(x => x.UpdatedAt).Skip((page - 1) * pageSize)
            .Take(pageSize).Select(x => ToDto(x)).ToListAsync(ct);
        return Ok(new PagedResult<LeadDto>(items, page, pageSize, total));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LeadDto>> Get(Guid id, CancellationToken ct)
    {
        var lead = await db.Leads.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return lead is null ? NotFound() : Ok(ToDto(lead));
    }

    [HttpPost]
    public async Task<ActionResult<LeadDto>> Create(LeadInput input, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!string.IsNullOrWhiteSpace(input.GooglePlaceId) && await db.Leads.AnyAsync(x => x.GooglePlaceId == input.GooglePlaceId, ct))
            return Conflict(new ProblemDetails { Title = "Este local já está no pipeline", Detail = "Já existe um lead associado a este place_id." });
        var lead = new Lead(input.BusinessName, input.Category, input.Description, input.Phone,
            input.Email, input.Website, input.Address, input.City, input.State, input.Country,
            input.Source, input.SourceUrl, input.GooglePlaceId);
        db.Leads.Add(lead);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = lead.Id }, ToDto(lead));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<LeadDto>> Update(Guid id, LeadInput input, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var lead = await db.Leads.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (lead is null) return NotFound();
        if (!string.IsNullOrWhiteSpace(input.GooglePlaceId) && await db.Leads.AnyAsync(x => x.Id != id && x.GooglePlaceId == input.GooglePlaceId, ct))
            return Conflict(new ProblemDetails { Title = "Este local já está no pipeline", Detail = "Já existe um lead associado a este place_id." });
        lead.Update(input.BusinessName, input.Category, input.Description, input.Phone,
            input.Email, input.Website, input.Address, input.City, input.State, input.Country,
            input.Source, input.SourceUrl, input.GooglePlaceId);
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(lead));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<LeadDto>> ChangeStatus(Guid id, [FromBody] StatusInput input, CancellationToken ct)
    {
        var lead = await db.Leads.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (lead is null) return NotFound();
        if (!Enum.IsDefined(input.Status) || !lead.TryTransitionTo(input.Status))
            return Conflict(new ProblemDetails { Title = "Transição de status inválida", Detail = $"Não é possível mudar de {lead.Status} para {input.Status}." });
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(lead));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var lead = await db.Leads.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (lead is null) return NotFound();
        db.Leads.Remove(lead);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static LeadDto ToDto(Lead x) => new(x.Id, x.BusinessName, x.Category, x.Description,
        x.Phone, x.Email, x.Website, x.Address, x.City, x.State, x.Country, x.Source, x.SourceUrl,
        x.Status, x.CreatedAt, x.UpdatedAt, x.GooglePlaceId);
}

public sealed record StatusInput(LeadStatus Status);

