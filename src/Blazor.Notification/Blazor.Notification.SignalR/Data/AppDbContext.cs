using Blazor.Notification.Models;
using Blazor.Notification.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;


namespace Blazor.Notification.SignalR.Data;

/// <summary>
/// Контекст in-memory базы данных.
/// </summary>
public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
  {
    Database.EnsureCreated();
    
  }




  /// <summary>
  /// Клиентские подключения.
  /// </summary>
  public DbSet<Connection> Connections { get; set; }

  /// <summary>
  /// Клиенты-пользователи сервиса Blazor.Notification.
  /// </summary>
  public DbSet<ServiceClient> ServiceClients { get; set; }

  /// <summary>
  /// Отправленные сообщения.
  /// </summary>
  public DbSet<Message> Messages { get; set; }

  /// <summary>
  /// Связи отправленных сообщений и их адресатов.
  /// </summary>
  public DbSet<MessageToClient> MessageReceivers { get; set; }





  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  {
    if (!optionsBuilder.IsConfigured)
    {
      optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=MyDatabase;Trusted_Connection=True;MultipleActiveResultSets=true");
      //optionsBuilder.UseInMemoryDatabase("AppDatabase");
    }
  }


  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Connection>(ent =>
    {
      ent.HasKey(x => x.Id);
      ent.HasOne(h => h.Previous).WithOne().HasForeignKey<Connection>(f => f.PrevId);
      ent.Property(p => p.ConnectReason).HasConversion(new EnumToStringConverter<ConnectReason>());
      ent.Property(p => p.DisconnectReason).HasConversion(new EnumToStringConverter<DisconnectReason>());
      ent.HasOne(h => h.Caller).WithMany(m => m.Connections).HasForeignKey(f => f.CallerId).IsRequired(false).OnDelete(DeleteBehavior.Cascade);
    });

    modelBuilder.Entity<Message>(ent =>
    {
      ent.HasOne(h => h.Sender).WithMany(m => m.OutBox).HasForeignKey(f => f.SenderId).IsRequired(false).OnDelete(DeleteBehavior.Cascade);
    });

    modelBuilder.Entity<MessageToClient>(ent => 
    {
      ent.HasOne(h => h.Receiver).WithMany(m => m.InBox).HasForeignKey(f => f.ReceiverId).OnDelete(DeleteBehavior.Cascade).IsRequired(true);
    });

    modelBuilder.Entity<ServiceClient>(ent =>
    {
      ent.HasKey(x => x.Id);
    });

  }




}
