using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace LeadIntelligence.Api.Services;

public sealed class PlacesSearchService(HttpClient http, IConfiguration configuration)
{
    private const string Endpoint = "https://places.googleapis.com/v1/places:searchText";
    private const string Fields = "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.primaryTypeDisplayName";

    public async Task<PlacesSearchResult> Search(string query, CancellationToken ct)
    {
        var key = configuration["GooglePlaces:ApiKey"] ?? configuration["GOOGLE_MAPS_API_KEY"];
        if (string.IsNullOrWhiteSpace(key)) throw new PlacesSearchException("A busca do Google Maps não está configurada. Defina GOOGLE_MAPS_API_KEY no ambiente da API.", HttpStatusCode.ServiceUnavailable);

        using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint);
        request.Headers.TryAddWithoutValidation("X-Goog-Api-Key", key);
        request.Headers.TryAddWithoutValidation("X-Goog-FieldMask", Fields);
        request.Content = JsonContent.Create(new { textQuery = query, languageCode = "pt-BR", pageSize = 10 });
        HttpResponseMessage sent;
        try { sent = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct); }
        catch (HttpRequestException) { throw new PlacesSearchException("Não foi possível conectar ao Google Maps. Tente novamente mais tarde.", HttpStatusCode.BadGateway); }
        catch (TaskCanceledException) when (!ct.IsCancellationRequested) { throw new PlacesSearchException("A busca no Google Maps excedeu o tempo limite. Tente novamente.", HttpStatusCode.GatewayTimeout); }
        using var response = sent;
        if (!response.IsSuccessStatusCode)
        {
            var status = response.StatusCode switch
            {
                HttpStatusCode.TooManyRequests => HttpStatusCode.TooManyRequests,
                HttpStatusCode.Forbidden => HttpStatusCode.BadGateway,
                HttpStatusCode.BadRequest => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.BadGateway
            };
            var message = response.StatusCode switch
            {
                HttpStatusCode.TooManyRequests => "Limite de uso do Google Maps atingido. Aguarde um pouco e tente novamente.",
                HttpStatusCode.Forbidden => "O Google Maps recusou a solicitação. Verifique a chave, o faturamento e se a Places API (New) está habilitada.",
                HttpStatusCode.BadRequest => "A consulta não foi aceita pelo Google Maps. Revise o texto e tente novamente.",
                _ => "O serviço do Google Maps está indisponível no momento. Tente novamente mais tarde."
            };
            throw new PlacesSearchException(message, status);
        }
        try
        {
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
            var places = json.RootElement.TryGetProperty("places", out var values) && values.ValueKind == JsonValueKind.Array
                ? values.EnumerateArray().Select(ParsePlace).Where(x => x.PlaceId.Length > 0).ToArray()
                : Array.Empty<PlaceCandidate>();
            return new PlacesSearchResult(places);
        }
        catch (JsonException) { throw new PlacesSearchException("O Google Maps retornou uma resposta inválida. Tente novamente.", HttpStatusCode.BadGateway); }
    }

    private static PlaceCandidate ParsePlace(JsonElement value) => new(
        Text(value, "id"), NestedText(value, "displayName", "text"), Text(value, "formattedAddress"),
        Text(value, "internationalPhoneNumber"), Text(value, "websiteUri"), NestedText(value, "primaryTypeDisplayName", "text"));
    private static string Text(JsonElement element, string name) => element.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" : "";
    private static string? NestedText(JsonElement element, string name, string sub) => element.TryGetProperty(name, out var value) && value.TryGetProperty(sub, out var text) && text.ValueKind == JsonValueKind.String ? text.GetString() : null;
}

public sealed record PlaceCandidate(string PlaceId, string? Name, string? Address, string? Phone, string? Website, string? Category);
public sealed record PlacesSearchResult(IReadOnlyList<PlaceCandidate> Places);
public sealed class PlacesSearchException(string message, HttpStatusCode status) : Exception(message) { public HttpStatusCode Status { get; } = status; }
