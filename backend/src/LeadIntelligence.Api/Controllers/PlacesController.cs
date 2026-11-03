using System.ComponentModel.DataAnnotations;
using System.Net;
using LeadIntelligence.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LeadIntelligence.Api.Controllers;

[ApiController]
[Route("api/places")]
public sealed class PlacesController(PlacesSearchService places) : ControllerBase
{
    [HttpPost("search")]
    [ProducesResponseType(typeof(PlacesSearchResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<PlacesSearchResult>> Search([FromBody] PlacesSearchInput input, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        try { return Ok(await places.Search(input.Query.Trim(), ct)); }
        catch (PlacesSearchException ex) { return Problem(statusCode: (int)ex.Status, title: ex.Message); }
    }
}

public sealed record PlacesSearchInput([Required, StringLength(200, MinimumLength = 3)] string Query);
