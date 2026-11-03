using LeadIntelligence.Api.Data;
using LeadIntelligence.Api.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using LeadIntelligence.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddCors(options => options.AddPolicy("local-ui", policy =>
    policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var connectionString = builder.Configuration.GetConnectionString("Database")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "Host=localhost;Port=5433;Database=lead_intelligence;Username=lead_app;Password=local-dev-password";
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddHttpClient<PlacesSearchService>().RedactLoggedHeaders(["X-Goog-Api-Key"]);

var app = builder.Build();
app.UseCors("local-ui");
if (app.Environment.IsDevelopment())
    app.MapOpenApi();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();

public partial class Program { }

