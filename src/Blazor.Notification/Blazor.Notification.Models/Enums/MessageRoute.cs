namespace Blazor.Notification.Models.Enums;

/// <summary>
/// Целевой чат для сообщения.
/// </summary>
public enum MessageRoute
{

  /// <summary>
  /// Не задано/не установлено/не известно/не применимо.
  /// </summary>
  None = 0,

  /// <summary>
  /// Сообщение должно быть отправлено в личный чат.
  /// </summary>
  Private = 1,

  /// <summary>
  /// Сообщение должно быть отправлено в общий чат.
  /// </summary>
  Common = 2,

}