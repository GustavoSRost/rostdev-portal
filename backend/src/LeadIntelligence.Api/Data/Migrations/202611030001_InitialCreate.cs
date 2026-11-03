using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using LeadIntelligence.Api.Data;

#nullable disable

namespace LeadIntelligence.Api.Data.Migrations;

[Migration("202611030001_InitialCreate")]
[DbContext(typeof(AppDbContext))]
public sealed class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "leads",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                business_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                category = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                phone = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                website = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                city = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                state = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                country = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                source = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                source_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            }, constraints: table => table.PrimaryKey("pk_leads", x => x.id));

        migrationBuilder.CreateIndex("ix_leads_status", "leads", "status");
        migrationBuilder.CreateIndex("ix_leads_category", "leads", "category");
        migrationBuilder.CreateIndex("ix_leads_city", "leads", "city");
        migrationBuilder.CreateIndex("ix_leads_source", "leads", "source");
        migrationBuilder.CreateIndex("ix_leads_created_at", "leads", "created_at");
    }

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable("leads");
}

