namespace Blazor.Notification.Models.Enums;

/// <summary>
/// <para>Причины закрытия подключений.</para>
/// </summary>
public enum DisconnectReason
{

  /// <summary>
  /// <para>Причина не указана/не установлена.</para>
  /// </summary>
  None = 0,

  /// <summary>
  /// <para>Подключение закрыто после того, как пользователь обновил страницу в браузере.</para>
  /// </summary>
  OnRefresh = 1,

  /// <summary>
  /// <para>Подключение закрыто после того, как пользователь перешел по другому адресу.</para>
  /// </summary>
  OnBrowse = 2,

  /// <summary>
  /// <para>Подключение закрыто по причине автоматического реконнекта по команде сервера.</para>
  /// </summary>
  OnReconnect = 3,

  /// <summary>
  /// <para>Подключение было закрыто принудительно после аварийного завершения работы приложения/браузера/и т.п.</para>
  /// </summary>
  OnError = 4,

  /// <summary>
  /// <para>Подключение было закрыто после закрытия окна/вкладки браузера.</para>
  /// </summary>
  OnExit = 5,

  /// <summary>
  /// <para>Другая причина.</para>
  /// </summary>
  OnOther = 10,

}
