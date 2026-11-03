using LeadIntelligence.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace LeadIntelligence.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Lead> Leads => Set<Lead>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var lead = modelBuilder.Entity<Lead>();
        lead.ToTable("leads");
        lead.HasKey(x => x.Id);
        lead.Property(x => x.Id).HasColumnName("id");
        lead.Property(x => x.BusinessName).HasColumnName("business_name").HasMaxLength(200).IsRequired();
        lead.Property(x => x.Category).HasColumnName("category").HasMaxLength(120);
        lead.Property(x => x.Description).HasColumnName("description").HasMaxLength(4000);
        lead.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(80);
        lead.Property(x => x.Email).HasColumnName("email").HasMaxLength(254);
        lead.Property(x => x.Website).HasColumnName("website").HasMaxLength(2048);
        lead.Property(x => x.Address).HasColumnName("address").HasMaxLength(300);
        lead.Property(x => x.City).HasColumnName("city").HasMaxLength(120);
        lead.Property(x => x.State).HasColumnName("state").HasMaxLength(120);
        lead.Property(x => x.Country).HasColumnName("country").HasMaxLength(120);
        lead.Property(x => x.Source).HasColumnName("source").HasMaxLength(120);
        lead.Property(x => x.SourceUrl).HasColumnName("source_url").HasMaxLength(2048);
        lead.Property(x => x.GooglePlaceId).HasColumnName("google_place_id").HasMaxLength(255);
        lead.HasIndex(x => x.GooglePlaceId).IsUnique().HasFilter("google_place_id IS NOT NULL");
        lead.Property(x => x.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(32).IsRequired();
        lead.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        lead.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();
        lead.HasIndex(x => x.Status);
        lead.HasIndex(x => x.Category);
        lead.HasIndex(x => x.City);
        lead.HasIndex(x => x.Source);
        lead.HasIndex(x => x.CreatedAt);
    }
}

