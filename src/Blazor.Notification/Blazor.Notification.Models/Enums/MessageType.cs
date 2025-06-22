namespace Blazor.Notification.Models.Enums;

/// <summary>
/// Типы сообщений.
/// </summary>
public enum MessageType
{

  /// <summary>
  /// Тип сообщения не установлен/не известен.
  /// </summary>
  None = 0,

  /// <summary>
  /// Сообщение фоновой задачи.
  /// </summary>
  System = 1,

  /// <summary>
  /// Сообщение от клиента другому/другим клиентам.
  /// </summary>
  Client = 2

}
