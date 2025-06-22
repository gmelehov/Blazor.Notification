namespace Blazor.Notification.Models.Enums;

/// <summary>
/// <para>Причины открытия подключений.</para>
/// </summary>
public enum ConnectReason
{

  /// <summary>
  /// <para>Причина не указана/не установлена.</para>
  /// </summary>
  None = 0,

  /// <summary>
  /// <para>Подключение открыто после того, как пользователь обновил страницу в браузере.</para>
  /// </summary>
  AfterRefresh = 1,

  /// <summary>
  /// <para>Подключение открыто после того, как пользователь перешел к новому адресу на странице браузера.</para>
  /// </summary>
  AfterBrowse = 2,

  /// <summary>
  /// <para>Подключение открыто после успешного автоматического реконнекта по команде сервера.</para>
  /// </summary>
  AfterReconnect = 3,

  /// <summary>
  /// <para>Подключение было открыто после принудительного закрытия зависшего подключения по причине аварийного завершения работы приложения/браузера/и т.п.</para>
  /// </summary>
  AfterError = 4,

  /// <summary>
  /// <para>Подключение было открыто после открытия страницы приложения в браузере.</para>
  /// </summary>
  AfterStart = 5,

  /// <summary>
  /// <para>Другая причина.</para>
  /// </summary>
  AfterOther = 10,

}