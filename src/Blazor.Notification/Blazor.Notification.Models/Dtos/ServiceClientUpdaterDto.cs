namespace Blazor.Notification.Models.Dtos;

/// <summary>
/// Модель данных, передаваемая на фронтенд при обновлении клиентского подключения.
/// </summary>
public class ServiceClientUpdaterDto
{

  /// <summary>
  /// Identity.
  /// </summary>
  public int Id { get; set; }


  public int UnreadCommonMsg { get; set; }


  public List<MessageUpdaterDto> Messages { get; set; } = [];

}