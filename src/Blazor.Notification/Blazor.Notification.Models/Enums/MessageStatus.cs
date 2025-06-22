using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Blazor.Notification.Models.Enums;

/// <summary>
/// Статусы сообщений.
/// </summary>
public enum MessageStatus
{

  /// <summary>
  /// Статус сообщения не установлен/не известен.
  /// </summary>
  None = 0,

  /// <summary>
  /// Сообщение отправлено.
  /// </summary>
  Sent = 1,

  /// <summary>
  /// Сообщение прочтено.
  /// </summary>
  Read = 2,

}
