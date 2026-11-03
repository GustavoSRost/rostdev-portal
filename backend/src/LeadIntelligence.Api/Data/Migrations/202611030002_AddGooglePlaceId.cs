using LeadIntelligence.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeadIntelligence.Api.Data.Migrations;

[Migration("202611030002_AddGooglePlaceId")]
[DbContext(typeof(AppDbContext))]
public sealed class AddGooglePlaceId : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "google_place_id", table: "leads", type: "character varying(255)", maxLength: 255, nullable: true);
        migrationBuilder.CreateIndex(name: "ix_leads_google_place_id", table: "leads", column: "google_place_id", unique: true, filter: "google_place_id IS NOT NULL");
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "ix_leads_google_place_id", table: "leads");
        migrationBuilder.DropColumn(name: "google_place_id", table: "leads");
    }
}
